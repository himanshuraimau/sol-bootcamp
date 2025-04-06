use anchor_lang::prelude::*;

declare_id!("3atXBCNGckTjdehYo6V4d6KHXf1mQfx1HzfW2LUremrK");

#[program]
pub mod favorites {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
