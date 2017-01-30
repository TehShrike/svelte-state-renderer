Use [Svelte](https://svelte.technology/) with [abstract-state-router](https://github.com/TehShrike/abstract-state-router)!

## Install

npm + your favorite CommonJS bundler is easiest.

```sh
npm install svelte-state-renderer
```

You can also [download the stand-alone build from wzrd.in](https://wzrd.in/standalone/svelte-state-renderer@latest).  If you include it in a `<script>` tag, a `svelteStateRenderer` function will be available on the global scope.

## Usage

```js
const StateRouter = require('abstract-state-router')
const makeSvelteStateRenderer = require('svelte-state-renderer')
const domready = require('domready')


const defaultParameters = {
	methods: {
		annoy() {
			alert('Modal dialogs are annoying')
		}
	}
}

const renderer = makeSvelteStateRenderer(defaultParameters)

domready(function() {
	const stateRouter = StateRouter(renderer, document.querySelector('body'))

	// add whatever states to the state router

	stateRouter.evaluateCurrentRoute('login')
})
```

## `makeSvelteStateRenderer(defaultParameters)`

Any parameters you pass in the `defaultParameters` object will be passed to all Svelte components when they are constructed.  In addition, any members of the `methods` object will be added to the object itself.

## In templates

Svelte components don't give you an easy way to corrupt them with stateful functions at the moment, but it is possible.  You can access the state router's `makePath` and `stateIsActive` functions on the `asr` object for now:

```
<a
	href="{{ asr.makePath('app.topics.tasks', { topicId: topic.id }) }}"
	class="{{ asr.stateIsActive('app.topics.tasks', { topicId: topic.id }) ? 'active' : '' }}"
>
	{{topic.name}}
</a>
```

## Passing templates to `addState`

When calling the abstract-state-router's `addState` function, you may provide any of these values as the `template`:

- a Svelte component constructor function
- an object with two properties:
	- `component`, a Svelte component constructor function
	- `options`, an object whose properties will be merged into the other default options and used to instantiate the Svelte components

# License

[WTFPL](http://wtfpl2.com/)
