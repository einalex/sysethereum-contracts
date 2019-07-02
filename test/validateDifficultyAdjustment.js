const utils = require('./utils');

contract('validateDifficultyAdjustment', (accounts) => {
  const owner = accounts[0];
  const submitter = accounts[1];
  const challenger = accounts[2];
  let claimManager;
  let superblocks;
  let proposedSuperblock;
  let ClaimManagerEvents;

  describe('Validate difficulty adjustment algorithm', () => {
    let genesisSuperblockHash;
    let proposesSuperblockHash;
    let battleSessionId;
    const genesisHeaders = [
      `04010010812eea0ef0443a0cbcaf394df736790de43826d3ddaaf6e6c7b107136576a496a2b74b4b472f225e07e236608499736c046dc73189fdc08ddd2eeadea827fb6eae90105de4f60d180000000001000000010000000000000000000000000000000000000000000000000000000000000000ffffffff640322e2082cfabe6d6d9bda4d6bd82779d8f1d7544a34fa3efd87c57d0b76fae03ebadae4238ddc6b9110000000f09f909f00144d696e656420627920646f6e676368616f35383800000000000000000000000000000000000000000000000500695d0000000000000401d4bd4d000000001976a914c825a1ecf2a6830c4401620c3a16f1995057c2ab88ac00000000000000002f6a24aa21a9ed219c987cab8ff732cde7442f8c0a3a614418bf11bcac9ab5100bd08becc0338a08000000000000000000000000000000002c6a4c2952534b424c4f434b3a2e1021d05359e04eb9c6c76ab8335b2d057eae231fdcdca99c3ca1779ec8339e0000000000000000266a24b9e11b6d9a929355288e57a0d637795001cf03178d872309af5806cf79f3f740139c65ddc351693c00000000000000000000000000000000000000000000000000000000000000000cd3966c2281b671cfd9941a420d2948109c6300b9f044d2dd82b10ef02d4790c045e6c86e3c89f66316c0a4035293a1cf5ab5cb626b11d8c748ab8d3565370bfebb5e3e34b64cc7f9d4d416237511f441e3bea177c0672b2461b1a3b7793dd8e2c590ec3dc24ba696d3cc740765c6fca88c300f14267eb4eb37cd4c56747eea6077eba21bfd2308168b3f963716ff60aacaf5eb97e374ef970ae02733ebae62fd38463d97e44fd54e79a25e48f6d687c614831d3152b3c9ac2f6b48bcfd55cd1eab16ce9994502d84ecf78200589327f618c4c8d06b821d697f918027c2e82f166e7923246c0e14947aafa993ad92989275242116cc51f02522b9172d8f0a3d410226ad5462fcf29184c752e7faf0ddb381eb6fe0f7f11bc0a1b585c2305171c98cd24bd92373e7fcc7bc93a70e6c91ced600b43cb149f996b60af000bcf391c6077fbb7f2e3eb578136ac37e5100eaf9da039b51269e23859ee06488bf3058485033e731b5076f4940d4a7a44ed5c873e2ee6c1456ebb3bd72ebc9011c381c4b00000000043d7a574282fb7c293d2f613cb29eac19750471759f9692f2df571b42e5e035643feee5244c18afb612c4846a8bf1b07759fedbdec9d139ade9f4c82736e17fe8a9e62c9b33c720172e453abbdcfc4342991ab7d9650053bc4d4c221c5c4f316b9d5aa628e6c4d0cb483b4331cd00c8e873378eaab5c036c69300ea4799328aad0e00000000004020e827260c2a678db287269be3718e321afa865e563aaf12000000000000000000fe3e50586989af865b90ee064b621252242b10c0c1d4e5bbdbe0e79aefe3f1f3d490105d03fd2517646c860c01020000000001010000000000000000000000000000000000000000000000000000000000000000ffffffff35039e8c000fe4b883e5bda9e7a59ee4bb99e9b1bc205b323031392d30362d32345430383a35383a32322e3436373239333333345a5dffffffff0310eda1330000000023210214a5f15a73686b64cf27405e018e2f06e0501b52f4ff98282badd9d6948fb57dac30c7e59a000000001976a91435bd005a61ac4ee33fb0f1e003b07c43d98e19a288ac0000000000000000266a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf90120000000000000000000000000000000000000000000000000000000000000000000000000`, // 358
      `04010010130fbe862a07a2188715d0d1d8581a969b70ee5dcc76a44dd543cf959a349b367596f8b8694a1c20e2911712fd84cce36ac3c504d475c03832eea59b92c12d80de90105de4f60d180000000001000000010000000000000000000000000000000000000000000000000000000000000000ffffffff640322e2082cfabe6d6d8f547652774e1f635521076e69b9e2a8fb1f4f6b4bf8aa7d729d495239848a5010000000f09f909f000f4d696e656420627920787874743132000000000000000000000000000000000000000000000000000000000500ab3e00000000000004b3d8154e000000001976a914c825a1ecf2a6830c4401620c3a16f1995057c2ab88ac00000000000000002f6a24aa21a9ed3701591bbb938f228c6e5d8efe4e9e64bded958e0d65869d9d56aff0dd39598a08000000000000000000000000000000002c6a4c2952534b424c4f434b3a4ea5c12f7cd67a5fa45e078e10c8ef0b0cfc5e92e7af7d6aeeb4f8b6c47b28530000000000000000266a24b9e11b6d9a929355288e57a0d637795001cf03178d872309af5806cf79f3f740139c65dd061c9a3b00000000000000000000000000000000000000000000000000000000000000000cd3966c2281b671cfd9941a420d2948109c6300b9f044d2dd82b10ef02d4790c045e6c86e3c89f66316c0a4035293a1cf5ab5cb626b11d8c748ab8d3565370bfef9e780ed40cf155f85711d812e27702017b2185bc630768d7efb989fb7f299029b943f9e876306505f9914336d4bacb7f4e66e4f36f428d70b2ffb559c873835ff7d008a8139d2f0c7b9fda4040b571c46f6c80be84e9ba4dd2f990733b677928ca453f98a145d5b9ac0e1a6b1aae90b3abc23d84a63c4621b430bb4f593c6084f3120e801e06f80724f2de548b6f17e72aa4e0ec1e4fb4347563b244298228a52657dab52bae59c5333718c12d4b32365a5c829245642c14409d8f43a95d5cb01b8e3ceea94d4c19463046d106bad095e4109d83acaf023f5d0a915c9bc1c4799ee60509db15c68cfbb87077f2203430adb864731dad38e4bc222947caa34f3916d68fe0d1a22983b98a5465996a53e5c2afad259286fc7c825be07d2b91359ec2ae1d258325aba6cbee1446868097997dff19c11b46e72bb6cd051c76788b70000000004c631ce1750d83ad54a2a9dda60aa4e9a624b681678b04439b6ad1871c8977d243feee5244c18afb612c4846a8bf1b07759fedbdec9d139ade9f4c82736e17fe88bbeae9a3a23e7c12194e487565e085354bf4d811f4088715df12b1845691e45d2d87caabc2bb5a13cdf18c0409d7f4f060321bd453597e51fd14e33a4d0b06a0e00000000004020e827260c2a678db287269be3718e321afa865e563aaf12000000000000000000366bf17245bdbb186a68e6b76b94c49d2f419242fa50a2d5ff98e944e32a6ecd1391105d03fd2517d63b052101020000000001010000000000000000000000000000000000000000000000000000000000000000ffffffff35039f8c000fe4b883e5bda9e7a59ee4bb99e9b1bc205b323031392d30362d32345430383a35393a31302e3635393834323838325a5dffffffff0310eda1330000000023210214a5f15a73686b64cf27405e018e2f06e0501b52f4ff98282badd9d6948fb57dac30c7e59a000000001976a914c765eabba7453c5483ee3b91306a57c25c85841688ac0000000000000000266a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf90120000000000000000000000000000000000000000000000000000000000000000000000000`, // 359
    ];
    const headers = [
      `04010010551647bfd888418142c493de37a698f575b7c6c5082ec03645a7269764db1efec217239a6fc5c50d58ca9e06af3dff608be20f92fd209aec186b7c1df72eb2c51a91105d03520c180000000001000000010000000000000000000000000000000000000000000000000000000000000000ffffffff640322e2082cfabe6d6dd512948a319f8bd466a1b22299a84ac2ff5160e2c8f4b93962c625be67685d4810000000f09f909f00124d696e65642062792079616e676b61693436000000000000000000000000000000000000000000000000000500adcf00000000000004c4d08d4e000000001976a914c825a1ecf2a6830c4401620c3a16f1995057c2ab88ac00000000000000002f6a24aa21a9ed6d1a78c3e342935ab7aa413429143e304676c1c3df1affd7d5c5f87c24f29c5c08000000000000000000000000000000002c6a4c2952534b424c4f434b3a0e819f60672a5165ef377a71cbbc9797c0f46b92c24b68be6d07287472bcb8960000000000000000266a24b9e11b6d9a929355288e57a0d637795001cf03178d872309af5806cf79f3f740139c65ddb055503c00000000000000000000000000000000000000000000000000000000000000000cd3966c2281b671cfd9941a420d2948109c6300b9f044d2dd82b10ef02d4790c045e6c86e3c89f66316c0a4035293a1cf5ab5cb626b11d8c748ab8d3565370bfe38795b1f56032b7f93bc1755ac297dbef6b63473fa81dc89d8b31593714d9ce5b69e1ef2f0849375d8cb2929b9363a8cce99b8b96849ec59590cea6d5e0fb7fbe8d734a8ad2451f394ea9d3b46fc1b1fa92e54aca6baaa7de8fbbe56e8c78cc6dde4b110f7e9a25902e9f700d7f38e34507d8325ff33c3f2a77851b83673cffb6ebbeedd2634b4b93b931afe3abccaf227acfec01ba8f3c92f958af3d90d8713fc0f5944756ecb01b73e41d9273125eeb685aa0783e23d17869a13ab264d63e914ac8edb2b16591cd0114208dc5bb28064cb1ce0ea3fa370c87b365f8c5178109077ca0b7801752d2566ddfcd744eefab280e91817d2eafa4ebbca9b0f7f4a0253a20211a26acf01a2e9d100fcd47c5d75005112070b508f90e774a8445b4a3b39e5a2d8cb89de5868315ca66630d8c4b8322b3fdbf18d7d2c2c88e184daad7f000000000468c776a9476f92911f9a5ab474d4601a9773127578fb20f97951c764b73a6cc73feee5244c18afb612c4846a8bf1b07759fedbdec9d139ade9f4c82736e17fe88bbeae9a3a23e7c12194e487565e085354bf4d811f4088715df12b1845691e45500b358428ab4e78a8225ef583c67110f7a8d4ce0dcf635665a47aec078f711e0e00000000004020e827260c2a678db287269be3718e321afa865e563aaf120000000000000000008e08fc5ca9deefbf12d71c1f3f5a8f059f2cdfa55b1cdbb78eaef95013cfb0b94691105d03fd251740ecc9b301020000000001010000000000000000000000000000000000000000000000000000000000000000ffffffff3503a08c000fe4b883e5bda9e7a59ee4bb99e9b1bc205b323031392d30362d32345430393a30303a31302e3032303430373637385a5dffffffff0310eda1330000000023210214a5f15a73686b64cf27405e018e2f06e0501b52f4ff98282badd9d6948fb57dac30c7e59a000000001976a914982e9a9f18560f501b1b3024baf56969f6b5518d88ac0000000000000000266a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf90120000000000000000000000000000000000000000000000000000000000000000000000000`, // 360 (adjusts)
      `040100104f9d1c30159d2e9d782fd226ce369bc8051772a7e54bbc749bd2d30929df914b46ed6a5c6f104cd39cb2e4a69fbc82f5aae0009bd1c340bd686f49a09eab8c265391105d03520c180000000001000000010000000000000000000000000000000000000000000000000000000000000000ffffffff640322e2082cfabe6d6d01e9c80255b815fabf2b50eae622eba7fa585857f107e4ca2b721f0828f82e6210000000f09f909f000f4d696e6564206279206c786c6c786c0000000000000000000000000000000000000000000000000000000005003d5655520000000004a112db4e000000001976a914c825a1ecf2a6830c4401620c3a16f1995057c2ab88ac00000000000000002f6a24aa21a9ed60a3c3ed34246ad7a9fc763474a019afba6dca25937ffec27897627b9787fe0d08000000000000000000000000000000002c6a4c2952534b424c4f434b3a0d0c8d021e4bd9155bb1fdbb85a81dcbd8111d0786305ebac053d3e301cc264e0000000000000000266a24b9e11b6d9a929355288e57a0d637795001cf03178d872309af5806cf79f3f740139c65dd3289473b00000000000000000000000000000000000000000000000000000000000000000cd3966c2281b671cfd9941a420d2948109c6300b9f044d2dd82b10ef02d4790c045e6c86e3c89f66316c0a4035293a1cf5ab5cb626b11d8c748ab8d3565370bfe38795b1f56032b7f93bc1755ac297dbef6b63473fa81dc89d8b31593714d9ce5b69e1ef2f0849375d8cb2929b9363a8cce99b8b96849ec59590cea6d5e0fb7fb7d943a59ee97db947909016eb07ce54559848ddbceda3e585bcff98aa9e5b7050ba3b6c2cbf2e28e4b14511136a6fe231df8aeeba4850916fb6bdbc7762b06136bdfcc83ecabc19690de54adfd084b1b40528a70d8fe7a1b2c3d3b1a3973e83339d65de1a7f3ff3fe736f6048c847151f23172327909887d69e9b4df2ddbe8de155883809382ca6c23f80e587c91a51a0301b440a2eee26432bd6353f0aa06f890d26a91ce69b753363390ef90d9ba47359a54cdbc49fcd9a2a0e4a07b99617e2fc4ae81f98a4ccb49837db45daf17b3472dad576fc5210addbd81cbddfbff19a6c036ac0c2067c75da3d0a37e7d7cff0b2b19a6b6d6fd8c3a30f4e3a71d753a000000000468c776a9476f92911f9a5ab474d4601a9773127578fb20f97951c764b73a6cc73feee5244c18afb612c4846a8bf1b07759fedbdec9d139ade9f4c82736e17fe88bbeae9a3a23e7c12194e487565e085354bf4d811f4088715df12b1845691e45579b49c33c872ebf305f97d6752c02cd8fbca1d4096f7fbd872dd2e86a061b130e00000000000020e827260c2a678db287269be3718e321afa865e563aaf12000000000000000000f33869424a22791b8e3d59d34cbd6c75c66ba7bbf6c0e2bce7e27e5e3a5f26c09b91105d03fd25175cf6d93301020000000001010000000000000000000000000000000000000000000000000000000000000000ffffffff3503a18c000fe4b883e5bda9e7a59ee4bb99e9b1bc205b323031392d30362d32345430393a30313a30372e3737393439383032325a5dffffffff0310eda1330000000023210214a5f15a73686b64cf27405e018e2f06e0501b52f4ff98282badd9d6948fb57dac30c7e59a000000001976a914dfa790985ea22f7177458eb7d094d8c209ab440088ac0000000000000000266a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf90120000000000000000000000000000000000000000000000000000000000000000000000000` // 361
    ];
    const initAccumulatedWork = web3.utils.toBN("0x0000000000000000000000000000000000000000000786f7e33013f43c0af7d0");
    const initParentHash = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const genesisSuperblock = utils.makeSuperblock(genesisHeaders, initParentHash, initAccumulatedWork);
    const hashes = headers.map(header => utils.calcBlockSha256Hash(header));
    proposedSuperblock = utils.makeSuperblock(headers,
      genesisSuperblock.superblockHash,
      genesisSuperblock.accumulatedWork
    );

    beforeEach(async () => {
      ({
        superblocks,
        claimManager,
        battleManager,
      } = await utils.initSuperblockChain({
        network: utils.SYSCOIN_REGTEST,
        genesisSuperblock,
        params: utils.OPTIONS_SYSCOIN_REGTEST,
        from: owner,
      }));
      genesisSuperblockHash = genesisSuperblock.superblockHash;
      const best = await superblocks.getBestSuperblock();
      assert.equal(genesisSuperblockHash, best, 'Best superblock should match');
      await claimManager.makeDeposit({ value: utils.DEPOSITS.MIN_PROPOSAL_DEPOSIT, from: submitter });
      await claimManager.makeDeposit({ value: utils.DEPOSITS.MIN_CHALLENGE_DEPOSIT, from: challenger });
    });
    it('Confirm difficulty adjusts and convicts challenger', async () => {
      result = await claimManager.proposeSuperblock(
        proposedSuperblock.merkleRoot,
        proposedSuperblock.accumulatedWork,
        proposedSuperblock.timestamp,
        proposedSuperblock.lastHash,
        proposedSuperblock.lastBits,
        proposedSuperblock.parentId,
        { from: submitter },
      );

      const superblockClaimCreatedEvent = utils.findEvent(result.logs, 'SuperblockClaimCreated');
      assert.ok(superblockClaimCreatedEvent, 'New superblock proposed');
      proposesSuperblockHash = superblockClaimCreatedEvent.args.superblockHash;
      claim1 = proposesSuperblockHash;
      await claimManager.makeDeposit({ value: utils.DEPOSITS.MIN_CHALLENGE_DEPOSIT, from: challenger });
      result = await claimManager.challengeSuperblock(proposesSuperblockHash, { from: challenger });
      const superblockClaimChallengedEvent = utils.findEvent(result.logs, 'SuperblockClaimChallenged');
      assert.ok(superblockClaimChallengedEvent, 'Superblock challenged');
      assert.equal(claim1, superblockClaimChallengedEvent.args.superblockHash);

      const verificationGameStartedEvent = utils.findEvent(result.logs, 'VerificationGameStarted');
      assert.ok(verificationGameStartedEvent, 'Battle started');
      battleSessionId = verificationGameStartedEvent.args.sessionId;

      await claimManager.makeDeposit({ value: utils.DEPOSITS.RESPOND_MERKLE_COST, from: challenger });
      result = await battleManager.queryMerkleRootHashes(proposesSuperblockHash, battleSessionId, { from: challenger });
      assert.ok(utils.findEvent(result.logs, 'QueryMerkleRootHashes'), 'Query merkle root hashes');

      await claimManager.makeDeposit({ value: utils.DEPOSITS.VERIFY_SUPERBLOCK_COST, from: submitter });
      result = await battleManager.respondMerkleRootHashes(proposesSuperblockHash, battleSessionId, hashes, { from: submitter });
      assert.ok(utils.findEvent(result.logs, 'RespondMerkleRootHashes'), 'Respond merkle root hashes');

      await claimManager.makeDeposit({ value: utils.DEPOSITS.RESPOND_LAST_HEADER_COST, from: challenger });
      result = await battleManager.queryLastBlockHeader(battleSessionId, { from: challenger });
      assert.ok(utils.findEvent(result.logs, 'QueryLastBlockHeader'), 'Query block header');
      
      await claimManager.makeDeposit({ value: utils.DEPOSITS.RESPOND_LAST_HEADER_COST, from: challenger });

      result = await battleManager.respondLastBlockHeader(battleSessionId, `0x${headers[1]}`, { from: submitter });
      assert.ok(utils.findEvent(result.logs, 'RespondLastBlockHeader'), 'Respond last block header');

      // Verify diff change and challenger is at fault (its actually valid)
      result = await battleManager.verifySuperblock(battleSessionId, { from: submitter });
      assert.ok(utils.findEvent(result.logs, 'ChallengerConvicted'), 'Challenger failed');

      // Confirm superblock
      await utils.blockchainTimeoutSeconds(2*utils.OPTIONS_SYSCOIN_REGTEST.TIMEOUT);
      result = await claimManager.checkClaimFinished(proposesSuperblockHash, { from: submitter });
      assert.ok(utils.findEvent(result.logs, 'SuperblockClaimPending'), 'Superblock semi approved');
    });
   
  });
});
