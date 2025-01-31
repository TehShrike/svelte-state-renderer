# 5.0.0

Hopefully not actually a breaking change for anyone, but the default props and options objects you pass into `addState` is no longer deeply merged with the instance props/options, they're only merged at the top level.
