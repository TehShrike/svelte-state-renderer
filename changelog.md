# 6.0.0

Fix some behavior around HMR.  Breaks compatibility with abstract-state-router versions before 8.0.1. [#31](https://github.com/TehShrike/svelte-state-renderer/pull/31)

# 5.0.1

Fix some issues introduced in 5.0.0.  [#30](https://github.com/TehShrike/svelte-state-renderer/pull/30/files)

# 5.0.0

Hopefully not actually a breaking change for anyone, but the default props and options objects you pass into `addState` is no longer deeply merged with the instance props/options, they're only merged at the top level.
