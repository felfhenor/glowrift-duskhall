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



## [0.1.6](https://github.com/felfhenor/glowrift-duskhall/compare/v0.1.5...v0.1.6) (2025-08-11)



## [0.1.5](https://github.com/felfhenor/glowrift-duskhall/compare/v0.1.4...v0.1.5) (2025-08-11)



## [0.1.4](https://github.com/felfhenor/glowrift-duskhall/compare/v0.1.3...v0.1.4) (2025-08-11)



## [0.1.3](https://github.com/felfhenor/glowrift-duskhall/compare/v0.1.2...v0.1.3) (2025-08-11)



## [0.1.2](https://github.com/felfhenor/glowrift-duskhall/compare/v0.1.1...v0.1.2) (2025-08-11)



## [0.1.1](https://github.com/felfhenor/glowrift-duskhall/compare/v0.1.0...v0.1.1) (2025-08-11)


### Bug Fixes

* **skill:** animation fixes ([0c03eb4](https://github.com/felfhenor/glowrift-duskhall/commit/0c03eb48788395f48c8000ffb8fd59a9a65b10b8)), closes [#91](https://github.com/felfhenor/glowrift-duskhall/issues/91)


### Features

* **analytics:** track various events anonymously in game ([9a57213](https://github.com/felfhenor/glowrift-duskhall/commit/9a572135eb97bc527b373a2c59d71453a610a174)), closes [#173](https://github.com/felfhenor/glowrift-duskhall/issues/173)
* **discord:** add discord rich presence ([2029fd3](https://github.com/felfhenor/glowrift-duskhall/commit/2029fd333293f753bcd20d4fb98cc0b91bb6583f)), closes [#176](https://github.com/felfhenor/glowrift-duskhall/issues/176)
* **location:** show guardian affinities/resistances/abilities ([cc5f77d](https://github.com/felfhenor/glowrift-duskhall/commit/cc5f77d9cf938de75ee29d2facbc9605f083d480))
* **skill:** add new skill broil, add support for scorched (lowers healing received) ([7806b6f](https://github.com/felfhenor/glowrift-duskhall/commit/7806b6fd5663b21095cf274371ff254c28321bb6))
* **ui:** make panel hierarchy a little more obvious. closes [#62](https://github.com/felfhenor/glowrift-duskhall/issues/62) ([df36157](https://github.com/felfhenor/glowrift-duskhall/commit/df36157c62be0ce3d4d4187bfef255224a8f61f6))
* **ui:** show attributes on techniques ([e3c1296](https://github.com/felfhenor/glowrift-duskhall/commit/e3c12961aa461b86ad8dbb190ee6a3bb06b937ba)), closes [#177](https://github.com/felfhenor/glowrift-duskhall/issues/177)



# [0.1.0](https://github.com/felfhenor/glowrift-duskhall/compare/d1caa904fc60439543b6866269c9076f4cc91ea3...v0.1.0) (2025-08-10)


### Bug Fixes

* background move when Sweetalert2 active ([8ed8eed](https://github.com/felfhenor/glowrift-duskhall/commit/8ed8eed71f44849107983161682227b2b7c8612c))
* **core:** reduce cpu usage by 50% lmao ([7d36f37](https://github.com/felfhenor/glowrift-duskhall/commit/7d36f37fabf937de2b3707d13e95609e85c02a91))
* **map:** move to requestIdleCallback for canvas animations. closes [#166](https://github.com/felfhenor/glowrift-duskhall/issues/166) ([ac836dd](https://github.com/felfhenor/glowrift-duskhall/commit/ac836dd6ee88dab59c47f2f0ffa54a54655614ef))


### Features

* Add health color coding to combat log ([7ea3a67](https://github.com/felfhenor/glowrift-duskhall/commit/7ea3a67932a818b2c8840d7fcd2758948cb84a19))
* add item counts to inventory panel headers ([d1caa90](https://github.com/felfhenor/glowrift-duskhall/commit/d1caa904fc60439543b6866269c9076f4cc91ea3)), closes [#31](https://github.com/felfhenor/glowrift-duskhall/issues/31)
* **asset:** add webp images. closes [#161](https://github.com/felfhenor/glowrift-duskhall/issues/161) ([a827c46](https://github.com/felfhenor/glowrift-duskhall/commit/a827c46ff98b706fe69e791248a82f3e609f706b))
* **hero:** add ability to freely respec. closes [#171](https://github.com/felfhenor/glowrift-duskhall/issues/171) ([7ed31a2](https://github.com/felfhenor/glowrift-duskhall/commit/7ed31a2108d159a47742061df35bd4dbebec8a5e))
* show max level message and hide upgrade UI in panel-town-building-upgrade when building is max level ([#68](https://github.com/felfhenor/glowrift-duskhall/issues/68)) ([130ca40](https://github.com/felfhenor/glowrift-duskhall/commit/130ca40fc93267a1ac02e8da1d0e129bfe144a88))
* **ui:** improve responsiveness. closes [#93](https://github.com/felfhenor/glowrift-duskhall/issues/93) ([8062bd1](https://github.com/felfhenor/glowrift-duskhall/commit/8062bd135fef37756a197368127a17f58f1d443d))


### Reverts

* Revert "Fix failing tests by adjusting corner node placement density and updating test expectations" ([03a03ee](https://github.com/felfhenor/glowrift-duskhall/commit/03a03eeae7cfe02f5d7f0fd5c79e4dd6d2b5e272))



