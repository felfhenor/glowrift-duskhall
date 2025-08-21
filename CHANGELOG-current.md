# [0.2.0](https://github.com/felfhenor/glowrift-duskhall/compare/v0.1.6...v0.2.0) (2025-08-21)


### Bug Fixes

* **audio:** sound service should not break after a period of time ([fbed8fa](https://github.com/felfhenor/glowrift-duskhall/commit/fbed8fa31cbb16a7a7c20176ef186127030c5d34))
* **core:** make world gen finish ([34d68d1](https://github.com/felfhenor/glowrift-duskhall/commit/34d68d153f286234e8f31fc1f2ca33d12eb9cfbb))
* **currency:** disallow nan currencies ([30e3061](https://github.com/felfhenor/glowrift-duskhall/commit/30e30619280aecb31249ed38b494336276cf271f))
* **debug:** debug map node positions now uses node coordinate rather than screen coordinate ([450da45](https://github.com/felfhenor/glowrift-duskhall/commit/450da45b3039a1b370018b6012bd78f9105c5a47)), closes [#193](https://github.com/felfhenor/glowrift-duskhall/issues/193)
* **gameloop:** ensure ticks act correctly for num > 0 ([89d09e3](https://github.com/felfhenor/glowrift-duskhall/commit/89d09e349101cdaf0ea7210dc4aae798a2cf7875)), closes [#201](https://github.com/felfhenor/glowrift-duskhall/issues/201)
* **inventory:** inventory will no longer fail to filter items to 100 total per category ([8e4a3a4](https://github.com/felfhenor/glowrift-duskhall/commit/8e4a3a42dcf73969e2fe6ada33ab6e75b1b77e56))
* **location:** location attributes should be hoverable ([8ddb0cb](https://github.com/felfhenor/glowrift-duskhall/commit/8ddb0cb3d17fdc597c8bd6e4f7e8b3fa84e253bf))
* **map:** allow map nodes to be clickable even on their text/indicators ([172252e](https://github.com/felfhenor/glowrift-duskhall/commit/172252e6a3677a5db4437d4b3ea09804a9a4402d))
* **map:** fix fow revealing on claim/unclaim ([90d6186](https://github.com/felfhenor/glowrift-duskhall/commit/90d61867b7f99cde960e44abd85c382e750615d0)), closes [#214](https://github.com/felfhenor/glowrift-duskhall/issues/214)
* **map:** travel indicator uses real position instead of estimated ([adfa19a](https://github.com/felfhenor/glowrift-duskhall/commit/adfa19a24f9b8059b64cbc83125f560927db3ebb)), closes [#211](https://github.com/felfhenor/glowrift-duskhall/issues/211)
* **perf:** fog of war performance is better on larger maps. ([86f9e45](https://github.com/felfhenor/glowrift-duskhall/commit/86f9e455706ff469120e7fa417db085c54c26625)), closes [#196](https://github.com/felfhenor/glowrift-duskhall/issues/196)
* **performance:** fog of war performance improvements again ([8305e53](https://github.com/felfhenor/glowrift-duskhall/commit/8305e533c14d67bf07abc768e0d47bf7bf394e75))
* **timer:** move festival timer ending to a timer action ([9b10439](https://github.com/felfhenor/glowrift-duskhall/commit/9b10439f8a99cae57befcc16744c74696ac151ca)), closes [#192](https://github.com/felfhenor/glowrift-duskhall/issues/192)
* **town:** can now buy every item from merchant ([17742c0](https://github.com/felfhenor/glowrift-duskhall/commit/17742c0fe739f1348c6f370fbe896dffeeb18f23)), closes [#180](https://github.com/felfhenor/glowrift-duskhall/issues/180)
* **ui:** address some scrollbar needs for <800px heights. closes [#202](https://github.com/felfhenor/glowrift-duskhall/issues/202) ([56ef5ba](https://github.com/felfhenor/glowrift-duskhall/commit/56ef5ba52dd023b197b4c8081ee6bc3261029e58))
* **ui:** min height on panel header to prevent squish ([78c8f59](https://github.com/felfhenor/glowrift-duskhall/commit/78c8f59e3a6c5f9fcb3fcc6a8d7500d3245ced37))
* **ui:** remove light themes ([9997c49](https://github.com/felfhenor/glowrift-duskhall/commit/9997c49b0bf7ed701dd0164071a2e2c3d8164883))
* **worldgen:** when losing a distant location, it should get a similar number of guardians to what it had before ([bdd6982](https://github.com/felfhenor/glowrift-duskhall/commit/bdd6982f6af685c2435937c952b85ef8fb5292aa))


### Features

* **core:** add a debug option to change when saves happen. saving is now every 30s instead of instantly ([20dcf13](https://github.com/felfhenor/glowrift-duskhall/commit/20dcf13879c1b83dfc4b4fff5f4cf63a03cd99a5))
* **core:** add contributing docs. closes [#185](https://github.com/felfhenor/glowrift-duskhall/issues/185) ([003b16e](https://github.com/felfhenor/glowrift-duskhall/commit/003b16e34f36f2cad748f3211d0a3e6973d8f195))
* **core:** log combat messages once per round instead of immediately ([009a280](https://github.com/felfhenor/glowrift-duskhall/commit/009a280d402f45bf4e124f07b353525c77ba8a77))
* **core:** move from local storage to indexeddb ([9a113d6](https://github.com/felfhenor/glowrift-duskhall/commit/9a113d6e51f2215b56c5aa1b327d66208a00962d))
* **core:** trim skills/items before saving to minimize savefile size as much as possible. ([34ee962](https://github.com/felfhenor/glowrift-duskhall/commit/34ee9629001bba873441e3fc81fc812d4c0402ca)), closes [#208](https://github.com/felfhenor/glowrift-duskhall/issues/208)
* **debug:** add debug claim all to quickly test claiming the world ([0f020c8](https://github.com/felfhenor/glowrift-duskhall/commit/0f020c80c19ab0de7b92ca2a325289ba375a0a41))
* **gear:** add symmetry mechanic ([0e4fb66](https://github.com/felfhenor/glowrift-duskhall/commit/0e4fb663c045413d847c95f0397eae8836399c03)), closes [#188](https://github.com/felfhenor/glowrift-duskhall/issues/188)
* **location:** add location upgrades, rally point building, etc ([6dbf58a](https://github.com/felfhenor/glowrift-duskhall/commit/6dbf58a3c87ccbc2aa4d313d8d710f28901d03e5))
* **merchant:** merchant level reduces prices slightly. talents add cost to items ([5b91ad4](https://github.com/felfhenor/glowrift-duskhall/commit/5b91ad46d98f236ef8f754432c42ab16710a178c))
* **talent:** add new town-based talents for heroes ([0dad385](https://github.com/felfhenor/glowrift-duskhall/commit/0dad3857c9528804f33ee7f4b2dcef0576651af6))
* **town:** add upgrade message to town ([db8dc38](https://github.com/felfhenor/glowrift-duskhall/commit/db8dc38ae17281c03f2ade6a931bb8a151646119)), closes [#179](https://github.com/felfhenor/glowrift-duskhall/issues/179)
* **town:** added utility to upgrading salvager/alchemist ([274ab50](https://github.com/felfhenor/glowrift-duskhall/commit/274ab501862d9f896dbb7ebc4ea31f81ee6bfaf3))
* **town:** allow equipped items/skills to be enchanted ([5ace5ef](https://github.com/felfhenor/glowrift-duskhall/commit/5ace5eff83f7cbe591e124cb33bbf3f585100e2f)), closes [#199](https://github.com/felfhenor/glowrift-duskhall/issues/199)
* **town:** merchant items should factor in skills and traits when determining value, too ([a27cfd4](https://github.com/felfhenor/glowrift-duskhall/commit/a27cfd4d46a991ad47fee3d58d94d5479a720b7a))
* **town:** merchant now has a bonus trait chance ([7fd018f](https://github.com/felfhenor/glowrift-duskhall/commit/7fd018fdf3dd3ce525050156e70dd0699f146ec7))
* **ui:** add claim log, rather than using toasts (toasts take too much animation time) ([37ff472](https://github.com/felfhenor/glowrift-duskhall/commit/37ff4723a005ea5eae28b6972e5f032fd7154dbe))
* **ui:** add real click outside to close functionality. closes [#218](https://github.com/felfhenor/glowrift-duskhall/issues/218) ([f945dc8](https://github.com/felfhenor/glowrift-duskhall/commit/f945dc87ae5e77f6c6c66af0989a347957b62253))
* **ui:** add world panel, resource generation display area ([fe6919e](https://github.com/felfhenor/glowrift-duskhall/commit/fe6919ea42d320bb57398915810d01220633e403)), closes [#183](https://github.com/felfhenor/glowrift-duskhall/issues/183)
* **ui:** items/skills can now have flavor text ([b475fd0](https://github.com/felfhenor/glowrift-duskhall/commit/b475fd05507ca2043702a45fd7f8900da2e869ea))
* **ui:** swap this/equipped item to match normal game expectations ([743417e](https://github.com/felfhenor/glowrift-duskhall/commit/743417e787965fee335986ca8589470f2ae0a491)), closes [#197](https://github.com/felfhenor/glowrift-duskhall/issues/197)
* **worldgen:** make sure to space towns and villages 7 spaces apart ([c8ad03a](https://github.com/felfhenor/glowrift-duskhall/commit/c8ad03a939b55b5eb2dd6770b5b97d6e88113d91)), closes [#215](https://github.com/felfhenor/glowrift-duskhall/issues/215)


### Reverts

* Revert "Implement click outside panel feature for all panels" ([d48fe37](https://github.com/felfhenor/glowrift-duskhall/commit/d48fe3785d299499c0a4a288326bf09a1b242f8c))



