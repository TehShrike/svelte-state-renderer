import { mount, unmount } from 'svelte'

export default function SvelteStateRendererFactory({ props: defaultProps, ...defaultOptions } = {}) {
	return function makeRenderer(stateRouter) {
		const asr = {
			makePath: stateRouter.makePath,
			stateIsActive: stateRouter.stateIsActive,
			go: stateRouter.go,
			getActiveState: stateRouter.getActiveState,
		}

		async function render(context) {
			const { template, element: target, content = {} } = context
			const options = template.options || {}
			const props = $state({ ...content, ...defaultProps, asr })
			const svelte = mount(typeof template === 'function' ? template : template.component, { ...defaultOptions, target, props, ...options })

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
