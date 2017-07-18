const merge = require('deepmerge')

const copy = object => merge({}, object, { clone: true })

module.exports = function SvelteStateRendererFactory(defaultOptions = {}) {
	return function makeRenderer(stateRouter) {
		const asr = {
			makePath: stateRouter.makePath,
			stateIsActive: stateRouter.stateIsActive
		}

		function render(context, cb) {
			const { element: target, template, content } = context

			const rendererSuppliedOptions = merge(defaultOptions, {
				target,
				data: Object.assign(content, defaultOptions.data, { asr })
			})

			function construct(component, options) {
				return options.methods
					? instantiateWithMethods(component, options, options.methods)
					: new component(options)
			}

			let svelte

			try {
				if (typeof template === 'function') {
					svelte = construct(template, rendererSuppliedOptions)
				} else {
					const options = merge(rendererSuppliedOptions, template.options)

					svelte = construct(template.component, options)
				}
				svelte.asrReset = createComponentResetter(svelte)
			} catch (e) {
				cb(e)
				return
			}

			function onRouteChange() {
				svelte.set({
					asr
				})
			}

			stateRouter.on('stateChangeEnd', onRouteChange)

			svelte.on('destroy', () => {
				stateRouter.removeListener('stateChangeEnd', onRouteChange)
			})

			svelte.mountedToTarget = target
			cb(null, svelte)
		}

		return {
			render,
			reset: function reset(context, cb) {
				const svelte = context.domApi

				svelte.asrReset(context.content)

				cb()
			},
			destroy: function destroy(svelte, cb) {
				svelte.teardown()
				cb()
			},
			getChildElement: function getChildElement(svelte, cb) {
				try {
					const element = svelte.mountedToTarget
					const child = element.querySelector('uiView')
					cb(null, child)
				} catch (e) {
					cb(e)
				}
			}
		}
	}
}

function createComponentResetter(component) {
	const originalData = copy(component.get())

	return function reset(newData) {
		const resetObject = Object.create(null)
		Object.keys(component.get()).forEach(key => {
			resetObject[key] = undefined
		})
		Object.assign(resetObject, copy(originalData), newData)
		component.set(resetObject)
	}
}

function instantiateWithMethods(Component, options, methods) {
	// const coolPrototype = Object.assign(Object.create(Component.prototype), methods)
	// return Component.call(coolPrototype, options)
	return Object.assign(new Component(options), methods)
}
