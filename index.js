const merge = require(`deepmerge`)

module.exports = function SvelteStateRendererFactory(defaultOptions = {}) {
	return function makeRenderer(stateRouter) {
		const asr = {
			makePath: stateRouter.makePath,
			stateIsActive: stateRouter.stateIsActive,
		}

		function render(context) {
			const { element: target, template, content } = context

			const rendererSuppliedOptions = merge(defaultOptions, {
				target,
				props: Object.assign(content, defaultOptions.props, { asr }),
			})

			function construct(component, options) {
				return new component(options)
			}

			let svelte

			try {
				if (typeof template === `function`) {
					svelte = construct(template, rendererSuppliedOptions)
				} else {
					const options = merge(rendererSuppliedOptions, template.options)

					svelte = construct(template.component, options)
				}
			} catch (e) {
				return Promise.reject(e);
			}

			function onRouteChange() {
				svelte.$set({
					asr,
				})
			}

			stateRouter.on(`stateChangeEnd`, onRouteChange)

			svelte.asrOnDestroy = () => stateRouter.removeListener(`stateChangeEnd`, onRouteChange)
			svelte.mountedToTarget = target

			return Promise.resolve(svelte);
		}

		return {
			render,
			reset: function reset(context) {
				const svelte = context.domApi
				const element = svelte.mountedToTarget

				svelte.asrOnDestroy()
				svelte.$destroy()

				const renderContext = Object.assign({ element }, context)

				return render(renderContext)
			},
			destroy: function destroy(svelte) {
				svelte.asrOnDestroy()
				svelte.$destroy()
				return Promise.resolve();
			},
			getChildElement: function getChildElement(svelte) {
				try {
					const element = svelte.mountedToTarget
					const child = element.querySelector(`uiView`)
					return Promise.resolve(child);
				} catch (e) {
					return Promise.reject(e);
				}
			},
		}
	}
}
