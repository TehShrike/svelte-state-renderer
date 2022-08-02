Use [Svelte](https://svelte.technology/) with [abstract-state-router](https://github.com/TehShrike/abstract-state-router)!

- `svelte-state-renderer` 1 is compatible with `svelte` 1
- `svelte-state-renderer` 2 is compatible with `svelte` >=1.8.1
- `svelte-state-renderer` 3 is compatible with `svelte` 3

## Install

npm + your favorite CommonJS bundler is easiest.

```sh
npm install svelte-state-renderer
```

You can also [download the stand-alone build from bundle.run](https://bundle.run/svelte-state-renderer@latest).  If you include it in a `<script>` tag, a `svelteStateRenderer` function will be available on the global scope.

## Usage

```js
const StateRouter = require('abstract-state-router')
const makeSvelteStateRenderer = require('svelte-state-renderer')


const defaultParameters = {
	props: {
		annoy() {
			alert('Modal dialogs are annoying')
		}
	}
}

const renderer = makeSvelteStateRenderer(defaultParameters)
const stateRouter = StateRouter(renderer, document.querySelector('body'))

// add whatever states to the state router

stateRouter.evaluateCurrentRoute('login')
```

## `makeSvelteStateRenderer(defaultParameters)`

Any parameters you pass in the `defaultParameters` object will be passed to all Svelte components when they are constructed.  In addition, any members of the `methods` object will be added to the object itself.

## In templates

To access the `asr` object with its `makePath`, `stateIsActive`, and `go` functions, you can `export let asr` in your template.

You will access any properties of the object returned by your `resolve` function in the same way – if your `resolve` function returns `{ userId: 13 }` then you would access that value by putting `export let userId` into your component.

```html
<script>
	export let asr
	export let userId
</script>

<a
	href="{ asr.makePath('app.topics.tasks', { topicId: topic.id }) }"
	class="{ asr.stateIsActive('app.topics.tasks', { topicId: topic.id }) ? 'active' : '' }"
>
	{topic.name}
</a>
```

To embed child states, add a `<uiView></uiView>` element to the parent template.

## Passing templates to `addState`

When calling the abstract-state-router's `addState` function, you may provide any of these values as the `template`:

- a Svelte component constructor function
- an object with two properties:
	- `component`, a Svelte component constructor function
	- `options`, an object whose properties will be merged into the other default options and used to instantiate the Svelte components

# License

[WTFPL](http://wtfpl2.com/)
