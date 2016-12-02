const activeStateNameKey = 'abstractStateRouterActiveStateName'
const activeStateParametersKey = 'abstractStateRouterActiveStateParameters'

module.exports = function SvelteStateRendererFactory(svelteOptions = {}) {
	return function makeRenderer(stateRouter) {

		const asr = {
			makePath: stateRouter.makePath,
			stateIsActive: stateRouter.stateIsActive
		}

		const defaultOptions = recursiveExtend(svelteOptions, {
			data: { asr }
		})

		function render(context, cb) {
			const { element: target, template, content } = context

			const rendererSuppliedOptions = recursiveExtend(defaultOptions, {
				target,
				data: Object.assign(content, defaultOptions.data)
			})

			let svelte

			try {
				if (typeof template === 'function') {
					svelte = new template(rendererSuppliedOptions)
				} else {
					const options = recursiveExtend(rendererSuppliedOptions, template.options)

					svelte = new template.component(options)
					Object.assign(svelte, options.methods)
				}
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

			svelte.on('teardown', () => {
				stateRouter.removeListener('stateChangeEnd', onRouteChange)
			})

			svelte.mountedToTarget = target
			cb(null, svelte)
		}

		return {
			render,
			reset: function reset(context, cb) {
				const svelte = context.domApi
				const target = svelte.mountedToTarget
				svelte.teardown()

				const newContext = Object.assign({}, context, {
					element: target
				})

				render(newContext, cb)
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

function recursiveExtend(...objects) {
	const target = {}

	Object.assign(target, ...objects)

	objects.filter(o => o).forEach(o => {
		objectProperties(o).forEach(key => {
			recursiveExtend(target[key], o[key])
		})
	})

	return target
}

function objectProperties(o) {
	return Object.keys(o).filter(key => {
		return o[key] && typeof o[key] === 'object'
	})
}
