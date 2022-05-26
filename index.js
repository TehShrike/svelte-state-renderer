const merge = require(`deepmerge`)

module.exports = function SvelteStateRendererFactory(defaultOptions = {}) {
	return function makeRenderer(stateRouter) {
		const asr = {
			makePath: stateRouter.makePath,
			stateIsActive: stateRouter.stateIsActive,
		}

		async function render(context) {
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
				throw new Error(e)
			}

			function onRouteChange() {
				svelte.$set({
					asr,
				})
			}

			stateRouter.on(`stateChangeEnd`, onRouteChange)

			svelte.asrOnDestroy = () => stateRouter.removeListener(`stateChangeEnd`, onRouteChange)
			svelte.mountedToTarget = target

			return svelte
		}

		return {
			render,
			reset: async function reset(context) {
				const svelte = context.domApi
				const element = svelte.mountedToTarget

				svelte.asrOnDestroy()
				svelte.$destroy()

				const renderContext = Object.assign({ element }, context)

				return render(renderContext)
			},
			destroy: async function destroy(svelte) {
				svelte.asrOnDestroy()
				svelte.$destroy()

				return
			},
			getChildElement: async function getChildElement(svelte) {
				try {
					const element = svelte.mountedToTarget
					const child = element.querySelector(`uiView`)
					return child
				} catch (e) {
					throw new Error(e)
				}
			},
		}
	}
}
