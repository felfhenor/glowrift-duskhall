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



