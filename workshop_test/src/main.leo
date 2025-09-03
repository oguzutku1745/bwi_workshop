import credits.aleo;

// The 'workshop_buy_coffee' program.
program workshop_buy_coffee.aleo {

    const shop_address: address = aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px;
    // Define a coffee price in terms of Aleo
    const coffee_price: u64 = 1000000u64;


    // Define a mapping to store the total amount of coffee bought by each address
    mapping total_coffee:address => u8;

    // Buy it publicly (But keep the total amounts of coffee private)
    // Buy it privately
    // Combine private records
    // Split private records
    // Demonstrates: Const defining, only transition (as helper), finding program address, type casting, defining mappings, updating mappings in hybrid calls, importing other programs, interacting with other programs, async/await structure.

    transition find_address() {
        return(self.address);
    }
    
    // Like a credit card purchase.
    async transition buy_public(amount:u8) -> Future {

        let payment_amount:u64 = coffee_price * amount as u64;
        let f0: Future = credits.aleo/transfer_public_as_signer(shop_address, payment_amount);

        return(finalize_buy_public(f0, self.signer, amount));
    }

    async function finalize_buy_public(f0: Future, public buyer:address, public amount:u8) {
        f0.await();

        let current_coffee:u8 = Mapping::get_or_use(total_coffee, buyer, 0u8);
        Mapping::set(total_coffee, buyer, current_coffee + amount);
    }

    // Like a cash purchase. 
    async transition buy_private(credits_record:credits.aleo/credits, amount:u8) -> (credits.aleo/credits, credits.aleo/credits, Future) {

        let payment_amount:u64 = coffee_price * amount as u64;

        let (paid, remainder): (credits.aleo/credits, credits.aleo/credits) = credits.aleo/transfer_private(credits_record, shop_address, payment_amount);

        return (paid, remainder, finalize_buy_private(self.signer, amount));
    }

    async function finalize_buy_private(buyer:address, amount:u8) {
        let current_coffee:u8 = Mapping::get_or_use(total_coffee, buyer, 0u8);
        Mapping::set(total_coffee, buyer, current_coffee + amount);
    }


    transition combine_records(bill1:credits.aleo/credits, bill2:credits.aleo/credits) -> credits.aleo/credits {
        let combined_amount: credits.aleo/credits = credits.aleo/join(bill1, bill2);
        return combined_amount;
    }
    
    transition split_records(bill:credits.aleo/credits, amount_to_be_splitted:u64) -> (credits.aleo/credits,credits.aleo/credits) {

        let (main, remainder): (credits.aleo/credits, credits.aleo/credits) = credits.aleo/split(bill, amount_to_be_splitted);
        return (main,remainder);
    }

    @noupgrade
    async constructor() {
    }

}
