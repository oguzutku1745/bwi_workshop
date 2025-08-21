import credits.aleo;
program workshop_test.aleo;

mapping total_coffee:
    key as address.public;
    value as u8.public;

function find_address:

function buy_public:
    input r0 as u8.private;
    cast r0 into r1 as u64;
    mul 1000000u64 r1 into r2;
    call credits.aleo/transfer_public_as_signer aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px r2 into r3;
    async buy_public r3 self.signer r0 into r4;
    output r4 as workshop_test.aleo/buy_public.future;

finalize buy_public:
    input r0 as credits.aleo/transfer_public_as_signer.future;
    input r1 as address.public;
    input r2 as u8.public;
    await r0;
    get total_coffee[r1] into r3;
    add r3 r2 into r4;
    set r4 into total_coffee[r1];

function buy_private:
    input r0 as credits.aleo/credits.record;
    input r1 as u8.private;
    cast r1 into r2 as u64;
    mul 1000000u64 r2 into r3;
    call credits.aleo/transfer_private r0 aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px r3 into r4 r5;
    async buy_private self.signer r1 into r6;
    output r4 as credits.aleo/credits.record;
    output r5 as credits.aleo/credits.record;
    output r6 as workshop_test.aleo/buy_private.future;

finalize buy_private:
    input r0 as address.public;
    input r1 as u8.public;
    get total_coffee[r0] into r2;
    add r2 r1 into r3;
    set r3 into total_coffee[r0];

function combine_records:
    input r0 as credits.aleo/credits.record;
    input r1 as credits.aleo/credits.record;
    call credits.aleo/join r0 r1 into r2;
    output r2 as credits.aleo/credits.record;

function split_records:
    input r0 as credits.aleo/credits.record;
    input r1 as u64.private;
    call credits.aleo/split r0 r1 into r2 r3;
    output r2 as credits.aleo/credits.record;
    output r3 as credits.aleo/credits.record;

constructor:
    assert.eq edition 0u16;
