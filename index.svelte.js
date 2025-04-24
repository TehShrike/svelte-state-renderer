import { mount, unmount } from 'svelte'

export default function SvelteStateRendererFactory({ props: defaultProps, ...defaultOptions } = {}) {
	return function makeRenderer(stateRouter) {
		const stateInfo = new Map()
		const asr = {
			makePath: stateRouter.makePath,
			stateIsActive: stateRouter.stateIsActive,
			go: stateRouter.go,
			getActiveState: stateRouter.getActiveState,
		}

		async function render(context) {
			const { template, element: target, content = {}, name } = context
			const options = template.options || {}
			const props = $state({ ...content, ...defaultProps, asr })
			const svelte = mount(typeof template === 'function' ? template : template.component, { ...defaultOptions, target, props, ...options })

			function onRouteChange() {
				props.asr = asr
			}

			stateRouter.on(`stateChangeEnd`, onRouteChange)

			stateInfo.set(name, {
				asrOnDestroy: () => stateRouter.removeListener(`stateChangeEnd`, onRouteChange),
				mountedToTarget: target,
			})

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
			destroy: async function destroy(svelte, { name }) {
				stateInfo.get(name).asrOnDestroy()
				stateInfo.delete(name)
				return unmount(svelte)
			},
			getChildElement: async function getChildElement(_svelte, { name }) {
				const element = stateInfo.get(name).mountedToTarget
				const child = element.querySelector(`uiView`)
				return child
			},
		}
	}
}
