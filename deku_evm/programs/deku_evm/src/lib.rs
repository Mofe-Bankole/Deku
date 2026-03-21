use anchor_lang::prelude::*;

declare_id!("2TfJ1WvdwMKMGAa24rwUL7dM7dgJMNQH9sYQ1hUXgao1");

#[program]
pub mod deku_evm {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
