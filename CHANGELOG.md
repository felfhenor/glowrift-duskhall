## [0.3.3](https://github.com/felfhenor/glowrift-duskhall/compare/v0.3.2...v0.3.3) (2025-08-28)


### Bug Fixes

* **combat:** cap self at 1x and allies at 4x ([9a00552](https://github.com/felfhenor/glowrift-duskhall/commit/9a0055265daa798ef28ee97c79f70140705364e6)), closes [#128](https://github.com/felfhenor/glowrift-duskhall/issues/128)
* **location:** upgrades should show costs disabled when unable to buy, not the wrong message ([7261424](https://github.com/felfhenor/glowrift-duskhall/commit/7261424ce7f0b03b7dfefde1a6e62af0f317647f)), closes [#281](https://github.com/felfhenor/glowrift-duskhall/issues/281)
* **targetting:** allies targetting should be 1..4, not always 1 ([f858c96](https://github.com/felfhenor/glowrift-duskhall/commit/f858c969b74adc530f4291851dbfb80d0bf124ba))
* **ui:** fix esc/menu close behavior with nested menus ([8be4b24](https://github.com/felfhenor/glowrift-duskhall/commit/8be4b249695d00001c0d662708d16d0def176d21)), closes [#279](https://github.com/felfhenor/glowrift-duskhall/issues/279)
* **ui:** heroes should not constantly change talent trees when moving ([18127d1](https://github.com/felfhenor/glowrift-duskhall/commit/18127d16cacd09594138e7f4d8686bbde09bb02b)), closes [#280](https://github.com/felfhenor/glowrift-duskhall/issues/280)
* **ui:** make submenus for town panels show correctly ([dc041f5](https://github.com/felfhenor/glowrift-duskhall/commit/dc041f588b287fff13c384ef316081fcbf74ddb4)), closes [#282](https://github.com/felfhenor/glowrift-duskhall/issues/282)
* **worldgen:** make tiny worlds 50x50, same number of nodes, to minimize screen space misuage ([e1b1e08](https://github.com/felfhenor/glowrift-duskhall/commit/e1b1e086428bba3684390d946889e4099cb1f8cb)), closes [#175](https://github.com/felfhenor/glowrift-duskhall/issues/175)


### Features

* **empire:** empire management shows encounter and loot level ([853fd54](https://github.com/felfhenor/glowrift-duskhall/commit/853fd540be85d2722240ff47a32bb3d4d6e7e114))
* **hero:** allow heroes to swap skills by clicking the two slots ([085cfbc](https://github.com/felfhenor/glowrift-duskhall/commit/085cfbce566582616ae741436ff537f40c1822f8)), closes [#274](https://github.com/felfhenor/glowrift-duskhall/issues/274)
* **inventory:** add inventory sort/filter settings ([f4ed274](https://github.com/felfhenor/glowrift-duskhall/commit/f4ed2746ae0a1d11e6f89d06538c5de4f296af0b)), closes [#263](https://github.com/felfhenor/glowrift-duskhall/issues/263)
* **item:** display skill/talent icons ([2a45a95](https://github.com/felfhenor/glowrift-duskhall/commit/2a45a956652939db7ebe5a61cca2e8edf4d8f869)), closes [#224](https://github.com/felfhenor/glowrift-duskhall/issues/224)
* **map:** add current indicator arrow above current location ([22ad1e4](https://github.com/felfhenor/glowrift-duskhall/commit/22ad1e494d91f5b79f5d997a54d91d356c97cdb8)), closes [#262](https://github.com/felfhenor/glowrift-duskhall/issues/262)
* **ui:** add a download button that links to itch if not in desktop build ([5b362c2](https://github.com/felfhenor/glowrift-duskhall/commit/5b362c2d6b1e1f6fa00c861da19809f803b0103c)), closes [#271](https://github.com/felfhenor/glowrift-duskhall/issues/271)
* **ui:** add failure indicator to show that heroes are failing ([2699f08](https://github.com/felfhenor/glowrift-duskhall/commit/2699f087864c9bd02a3524f5d3cea7278fbe4dc6)), closes [#269](https://github.com/felfhenor/glowrift-duskhall/issues/269)



## [0.3.2](https://github.com/felfhenor/glowrift-duskhall/compare/v0.3.1...v0.3.2) (2025-08-28)



## [0.3.1](https://github.com/felfhenor/glowrift-duskhall/compare/v0.3.0...v0.3.1) (2025-08-28)


### Bug Fixes

* **audio:** fix bgm option toggling at runtime, fix audiocontext not being re-initialized ([8b03105](https://github.com/felfhenor/glowrift-duskhall/commit/8b03105886050c5837f431f6ff5f1474d0964035)), closes [#259](https://github.com/felfhenor/glowrift-duskhall/issues/259)
* **combat:** heroes should not be able to overmax hp when leaving combat ([cb73dba](https://github.com/felfhenor/glowrift-duskhall/commit/cb73dbac37242082541ded5cc2a5a61aad8f8a6c)), closes [#273](https://github.com/felfhenor/glowrift-duskhall/issues/273)
* **core:** fire onload from state loading even if it has to set the default value ([0460eac](https://github.com/felfhenor/glowrift-duskhall/commit/0460eac43c9694cdda0d296f0b87883605972bdb))
* **core:** fix game state double loading ([db38d34](https://github.com/felfhenor/glowrift-duskhall/commit/db38d341439bd6028f228ed5f2d9c0788d2ea4dc))
* **options:** better ui hiding of elements that aren't relevant ([c0f5e24](https://github.com/felfhenor/glowrift-duskhall/commit/c0f5e24349d5273a4b2991df23ca5d08409454c5))
* **ui:** close menus when doing savefile shenanigans ([7efe8e7](https://github.com/felfhenor/glowrift-duskhall/commit/7efe8e7d648b9478b7d8f8e551040896400578b1)), closes [#258](https://github.com/felfhenor/glowrift-duskhall/issues/258)


### Features

* **cameo:** add some friendly faces to character create ([8979b41](https://github.com/felfhenor/glowrift-duskhall/commit/8979b4125a0d3d6b4d2c54240c9b4c803097e216)), closes [#276](https://github.com/felfhenor/glowrift-duskhall/issues/276)
* **ci:** add itch.io uploader ([b0247e2](https://github.com/felfhenor/glowrift-duskhall/commit/b0247e227c6a2b28f658099474b3b88e4575f56a)), closes [#181](https://github.com/felfhenor/glowrift-duskhall/issues/181)
* **game:** select medium size by default ([9e3e907](https://github.com/felfhenor/glowrift-duskhall/commit/9e3e90789fd6dfa8e305c76b65770717142efd00))
* **heroes:** add 2-layer close options; hitting esc will only close the submenu if open ([fd194ce](https://github.com/felfhenor/glowrift-duskhall/commit/fd194ce5aab9ce298f34fd11d5bbf35870d7d4d1)), closes [#270](https://github.com/felfhenor/glowrift-duskhall/issues/270)
* **heroes:** highlight talents that are learned from items ([1a4d526](https://github.com/felfhenor/glowrift-duskhall/commit/1a4d526ad1bb87c5fcc5e36ba5ece0beeeb12015))
* **heroes:** show skills gotten from items ([b6ae123](https://github.com/felfhenor/glowrift-duskhall/commit/b6ae123cfb47ef2ae09061615f68fefa81142ab7))
* **skill:** show estimated damage per target ([888a336](https://github.com/felfhenor/glowrift-duskhall/commit/888a336193039febaa33392224c29e2e04e4b507)), closes [#272](https://github.com/felfhenor/glowrift-duskhall/issues/272)
* **talents:** add option to auto-select most-invested talent tree (default=on) ([764939e](https://github.com/felfhenor/glowrift-duskhall/commit/764939ed5f9511adafa960aa33758d637edfd099)), closes [#260](https://github.com/felfhenor/glowrift-duskhall/issues/260)
* **ui:** add at-a-glance captures ([9a0b9c0](https://github.com/felfhenor/glowrift-duskhall/commit/9a0b9c0bd0b2d883da88092390ec2b7e9e716737)), closes [#278](https://github.com/felfhenor/glowrift-duskhall/issues/278)
* **ui:** improve size/visibility of close buttons ([631b5ee](https://github.com/felfhenor/glowrift-duskhall/commit/631b5ee6e9df2b4d0fec7515a9726a0ed5489a74)), closes [#264](https://github.com/felfhenor/glowrift-duskhall/issues/264)
* **ui:** move resources out onto the map ([789b783](https://github.com/felfhenor/glowrift-duskhall/commit/789b7835dfefd5a82389646cb778189f6ca5ad0e)), closes [#266](https://github.com/felfhenor/glowrift-duskhall/issues/266)
* **ui:** show at-a-glance hero view ([16be516](https://github.com/felfhenor/glowrift-duskhall/commit/16be5164c29160370afa2d3439cc8c712941536a)), closes [#265](https://github.com/felfhenor/glowrift-duskhall/issues/265)



# [0.3.0](https://github.com/felfhenor/glowrift-duskhall/compare/v0.2.1...v0.3.0) (2025-08-27)


### Bug Fixes

* **core:** gameloop should not run on homescreen. ([b304abb](https://github.com/felfhenor/glowrift-duskhall/commit/b304abbeb7d0eb078a42066ee65478cd5d6e3204))
* **core:** make laflotte always permanently claimed so it doesn't poof ([117eaa6](https://github.com/felfhenor/glowrift-duskhall/commit/117eaa642bcca2202490ea782e4d95e37325dcbe))
* **core:** wait for gamestate to load before migrating ([bc5f9d4](https://github.com/felfhenor/glowrift-duskhall/commit/bc5f9d47cf46b015d4b9047f771d2d65119d34cd)), closes [#241](https://github.com/felfhenor/glowrift-duskhall/issues/241)
* **debug:** toggling debug shouldn't trigger a rerun every time after, only the initial time it's toggled ([1c8c6a7](https://github.com/felfhenor/glowrift-duskhall/commit/1c8c6a7a42ed6b3bb6081b26a5cf22fd2d29af92))
* **hero:** fix hero stats not updating correctly. closes [#229](https://github.com/felfhenor/glowrift-duskhall/issues/229) ([03b4741](https://github.com/felfhenor/glowrift-duskhall/commit/03b4741485c148a932ccdf40bb0f122e3225c804))
* **hero:** hero health should always be a round number. closes [#230](https://github.com/felfhenor/glowrift-duskhall/issues/230) ([35306ca](https://github.com/felfhenor/glowrift-duskhall/commit/35306ca178701d9f262d705be1c20af5f6840f9a))
* **market:** cannot trade if input or output is 0 ([54fed1b](https://github.com/felfhenor/glowrift-duskhall/commit/54fed1b0d00c2d1b34198c89a1ba8e9802b77a0c)), closes [#243](https://github.com/felfhenor/glowrift-duskhall/issues/243)
* **migrate:** migrate should only commit changes once, instead of once per change ([f1ddb0f](https://github.com/felfhenor/glowrift-duskhall/commit/f1ddb0f7f2960c3ac1b111ff21a90d5439805237))
* **newplayer:** new player ux should make sense ([b125f1d](https://github.com/felfhenor/glowrift-duskhall/commit/b125f1d85ac29efa704ca61982b8a9bb4f0f2874)), closes [#227](https://github.com/felfhenor/glowrift-duskhall/issues/227)
* **salvage:** salvaging skills should always have at least some value to prevent errors ([387e4dc](https://github.com/felfhenor/glowrift-duskhall/commit/387e4dcd19d5e0e5ccbe1942d0c61b07d6d2948a))
* **skill:** skills w/ symmetry should get stat bonuses. closes [#228](https://github.com/felfhenor/glowrift-duskhall/issues/228) ([af01236](https://github.com/felfhenor/glowrift-duskhall/commit/af012368819e405bf3e825355db22e501b439d99))
* **skill:** strength of dustwisp should only apply damage to the damaging technique ([9433c66](https://github.com/felfhenor/glowrift-duskhall/commit/9433c66e5b06121015e31e31c69d7c9cecfc21da))
* **timer:** timer will now run previous missed actions, if any ([24c1b5b](https://github.com/felfhenor/glowrift-duskhall/commit/24c1b5b1da7a10429dc60b77683080edfb4722b9)), closes [#235](https://github.com/felfhenor/glowrift-duskhall/issues/235)
* **town:** fix alignment of upgrades in academy/blacksmith ([6246c6c](https://github.com/felfhenor/glowrift-duskhall/commit/6246c6c178b6fc81738cb5fde75d016ba3f8cd70)), closes [#254](https://github.com/felfhenor/glowrift-duskhall/issues/254)
* **town:** salvager/alchemist only update the state once per salvage, regardless of how many things were salvaged, creating way less ui lag ([9ac7778](https://github.com/felfhenor/glowrift-duskhall/commit/9ac77787c33052d49aa317b4c8fa43d3c38675fe)), closes [#232](https://github.com/felfhenor/glowrift-duskhall/issues/232)
* **travel:** 'too-hard' nodes should always come last ([cfc6cce](https://github.com/felfhenor/glowrift-duskhall/commit/cfc6ccefc43f2ebe9768e181132cf53325fb12b9)), closes [#244](https://github.com/felfhenor/glowrift-duskhall/issues/244)
* **ui:** fix data update error ([c226243](https://github.com/felfhenor/glowrift-duskhall/commit/c226243bb87f8eff6980c01f05f239d910b2307c))
* **ui:** fix panel heights for more resolutions ([e1da4c1](https://github.com/felfhenor/glowrift-duskhall/commit/e1da4c177cb8622ffb2143de6fe09fe72c142e99)), closes [#246](https://github.com/felfhenor/glowrift-duskhall/issues/246)
* **ui:** improve ui jank when holding down enter button on some interfaces. ([084a62f](https://github.com/felfhenor/glowrift-duskhall/commit/084a62f397b032a0f6be7a9961df1f764d5a2521)), closes [#239](https://github.com/felfhenor/glowrift-duskhall/issues/239)
* **worldgen:** add migration to make permanently claimed nodes have their own separate data. fix a few worldgen bugs ([f8aabb4](https://github.com/felfhenor/glowrift-duskhall/commit/f8aabb408617f32f65c8325fde17bf447540faf9))
* **worldgen:** don't infer worldcenter when picking guardian count ([2619a85](https://github.com/felfhenor/glowrift-duskhall/commit/2619a856e9e37946f39e3bfddcaccea024f8b0c6)), closes [#245](https://github.com/felfhenor/glowrift-duskhall/issues/245)
* **worldgen:** encounter level actually goes down and up with attributes ([5188aa9](https://github.com/felfhenor/glowrift-duskhall/commit/5188aa9fab61a22c2c7bf502fee4d68b0b3158ee))
* **worldgen:** space out towns/villages a little more ([8e59508](https://github.com/felfhenor/glowrift-duskhall/commit/8e5950810965ab46a8146bc09e451cd27ecd3841))
* **world:** unclaims should be blocked if the item is not claimed ([efe3484](https://github.com/felfhenor/glowrift-duskhall/commit/efe3484c61b5a53748259860d8e1dccf72ac31ad)), closes [#247](https://github.com/felfhenor/glowrift-duskhall/issues/247)


### Features

* **codex:** add skill technique types ([13ee683](https://github.com/felfhenor/glowrift-duskhall/commit/13ee683bebc5b0537a64fab3e01a1a9cddc485e2)), closes [#250](https://github.com/felfhenor/glowrift-duskhall/issues/250)
* **codex:** add some game mechanics ([8fa0a29](https://github.com/felfhenor/glowrift-duskhall/commit/8fa0a2910747dbb04bb5157eaeb22553fbb82423)), closes [#252](https://github.com/felfhenor/glowrift-duskhall/issues/252)
* **explore:** nodes can now have capture times rather than killing guardians ([f9bb30b](https://github.com/felfhenor/glowrift-duskhall/commit/f9bb30b6c1d58d9c0c72b34dc1f88f3692234711))
* **help:** add help panel ([211fa79](https://github.com/felfhenor/glowrift-duskhall/commit/211fa79e75e2f904c20a8998ac1cfa4d9d4427e6)), closes [#242](https://github.com/felfhenor/glowrift-duskhall/issues/242)
* **location:** location claim scaling based on level of party/location. closes [#238](https://github.com/felfhenor/glowrift-duskhall/issues/238) ([3d0204b](https://github.com/felfhenor/glowrift-duskhall/commit/3d0204b0b97821042ecc58836ab3a0f4431a8edd))
* **mainmenu:** allow options to be set from home screen ([a3dee5f](https://github.com/felfhenor/glowrift-duskhall/commit/a3dee5fe5c80d610f6920c688ee7f053ea7b8665)), closes [#249](https://github.com/felfhenor/glowrift-duskhall/issues/249)
* **sfx:** add sfx/bgm to more of the game ([dd08ecf](https://github.com/felfhenor/glowrift-duskhall/commit/dd08ecf76b238e6ff65bd41fb192846fb3efbe6b)), closes [#248](https://github.com/felfhenor/glowrift-duskhall/issues/248)
* **skill:** skills that target self will no longer do so more than 1x at a time ([15ecbd5](https://github.com/felfhenor/glowrift-duskhall/commit/15ecbd5451d0915c72a72d59daf9e75e3efb9dfc)), closes [#251](https://github.com/felfhenor/glowrift-duskhall/issues/251)
* **talent:** talents that are bought are now more distinguishable from ones that can't be bought ([67da314](https://github.com/felfhenor/glowrift-duskhall/commit/67da314b38e2a977e9f4e2884cfc6fa38193e1c6))
* **town:** scale enchantment cost by item rarity ([2ce8c64](https://github.com/felfhenor/glowrift-duskhall/commit/2ce8c647cad0b6d0e1fffc37b75275044729ca1b)), closes [#256](https://github.com/felfhenor/glowrift-duskhall/issues/256)
* **town:** show equipped by for equipped panels, blacksmith, academy ([9b64752](https://github.com/felfhenor/glowrift-duskhall/commit/9b6475256982c24f87768a9c2ac1afe1591e0ad8)), closes [#236](https://github.com/felfhenor/glowrift-duskhall/issues/236)
* **ui:** symmetry display on items should be colored ([307165c](https://github.com/felfhenor/glowrift-duskhall/commit/307165ca44a4ba7e173997743284f46a365b6716))
* **world:** add empire management screen. ([a8b0248](https://github.com/felfhenor/glowrift-duskhall/commit/a8b02484771281c0cc910451f7968c9c15805e28)), closes [#240](https://github.com/felfhenor/glowrift-duskhall/issues/240)



## [0.2.1](https://github.com/felfhenor/glowrift-duskhall/compare/v0.2.0...v0.2.1) (2025-08-22)


### Bug Fixes

* **changelog:** fix sizing and such in changelog ([4ee0419](https://github.com/felfhenor/glowrift-duskhall/commit/4ee0419ade4f0b5fe81a7d1f166a45c837a20fb5))
* **ui:** fix github link ([1b12cef](https://github.com/felfhenor/glowrift-duskhall/commit/1b12cef89e40eb29c36d0be96d676b67c3cd1e03))


### Features

* **claim:** upgrading to protection from evil will automatically permaclaim claimed nodes ([2d4adf5](https://github.com/felfhenor/glowrift-duskhall/commit/2d4adf577db54f993363d3c94f03f41e78a6a68b))
* **locupgrade:** add upgrades that only work when a node is permanently claimed. switch between them when permanently claiming. implement dust production. add linked upgrades so two can upgrade at the same time ([1fbfd2c](https://github.com/felfhenor/glowrift-duskhall/commit/1fbfd2cf25a82ad90c7f1e49e2114db558394a06))
* **ui:** rework pixi rendering. add zone of control for towns/maps. permanent control of some nodes is possible ([f44f63b](https://github.com/felfhenor/glowrift-duskhall/commit/f44f63bdde83a375e282372963575b44772dc944))



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



