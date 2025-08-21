// The 'test_workshop_test' test program.
import workshop_test.aleo;
program test_workshop_test.aleo {
    @test
    script test_it() {
        let result: u32 = workshop_test.aleo/main(1u32, 2u32);
        assert_eq(result, 3u32);
    }

    @test
    @should_fail
    transition do_nothing() {
        let result: u32 = workshop_test.aleo/main(2u32, 3u32);
        assert_eq(result, 3u32);
    }
    
    @noupgrade
    async constructor() {}
}
