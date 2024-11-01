import merge from 'deepmerge'
import { mount, unmount } from 'svelte'

export default function SvelteStateRendererFactory({props: defaultProps, ...defaultOptions} = {}) {
	return function makeRenderer(stateRouter) {
		const asr = {
			makePath: stateRouter.makePath,
			stateIsActive: stateRouter.stateIsActive,
			go: stateRouter.go,
			getActiveState: stateRouter.getActiveState,
		}

		async function render(context) {
			const { element: target, template, content } = context

			const props = $state(Object.assign(content, defaultProps, { asr }))

			const rendererSuppliedOptions = merge(defaultOptions, {
				target,
				props,
			})

			let svelte

			if (typeof template === `function`) {
				svelte = mount(template, rendererSuppliedOptions)
			} else {
				const options = merge(rendererSuppliedOptions, template.options)

				svelte = mount(template.component, options)
			}

			function onRouteChange() {
				props.asr = asr
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
				unmount(svelte)

				const renderContext = { element, ...context }

				return render(renderContext)
			},
			destroy: async function destroy(svelte) {
				svelte.asrOnDestroy()
				return unmount(svelte)
			},
			getChildElement: async function getChildElement(svelte) {
				const element = svelte.mountedToTarget
				const child = element.querySelector(`uiView`)
				return child
			},
		}
	}
}