use anchor_lang::prelude::*;

declare_id!("HSniT6AQXSahCPwQGM85A6Jjk4rGQRg7bVcovboB4Gav");

#[program]
pub mod programs {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
