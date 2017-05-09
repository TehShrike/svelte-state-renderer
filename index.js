const merge = require('deepmerge')

module.exports = function SvelteStateRendererFactory(svelteOptions = {}) {
	return function makeRenderer(stateRouter) {

		const asr = {
			makePath: stateRouter.makePath,
			stateIsActive: stateRouter.stateIsActive
		}

		const defaultOptions = merge(svelteOptions, {
			data: { asr }
		})

		function render(context, cb) {
			const { element: target, template, content } = context

			const rendererSuppliedOptions = merge(defaultOptions, {
				target,
				data: Object.assign(content, defaultOptions.data)
			})

			let svelte

			try {
				if (typeof template === 'function') {
					svelte = new template(rendererSuppliedOptions)
				} else {
					const options = merge(rendererSuppliedOptions, template.options)

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
