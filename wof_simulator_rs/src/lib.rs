use wasm_bindgen::prelude::*;

pub const BETS_LEN: usize = 6;

#[derive(Clone, Debug)]
pub struct Simulator {
    player_cash: i32,
    casino_credit: i32,
    max_wager: i32,
    bets: [i32; BETS_LEN],
}

impl Simulator {
    pub fn new(player_cash: i32, casino_credit: i32, max_wager: i32) -> Self {
        Self {
            player_cash,
            casino_credit,
            max_wager,
            bets: [0, 0, 0, 0, 0, 0],
        }
    }

    fn clamp_cash(&mut self) {
        if self.player_cash > 999_999_999 {
            self.player_cash = 999_999_999;
        }
    }

    fn total_wager(&self) -> i32 {
        let mut total = 0;
        for i in 0..BETS_LEN {
            total += self.bets[i];
        }
        total
    }

    fn get_magnitude(value: i32) -> i32 {
        if value <= 100 {
            return 1;
        }
        if value <= 1000 {
            return 10;
        }
        if value <= 10000 {
            return 100;
        }
        if value <= 100000 {
            return 1000;
        }
        10000
    }

    pub fn increase_wager(&mut self, bet: usize) -> i32 {
        let mut step_size = Self::get_magnitude(self.bets[bet]);
        let mut broken_step = self.player_cash + self.casino_credit;
        if step_size > broken_step {
            step_size = broken_step;
        }
        broken_step = self.max_wager - self.total_wager();
        if step_size > broken_step {
            step_size = broken_step;
        }
        if step_size < 0 {
            step_size *= -1;
        }
        self.bets[bet] += step_size;
        self.player_cash -= step_size;
        self.clamp_cash();

        0
    }

    pub fn decrease_wager(&mut self, bet: usize) -> i32 {
        if self.bets[bet] <= 2 {
            self.player_cash += self.bets[bet];
            self.clamp_cash();
            self.bets[bet] = 0;
        } else {
            let mag = Self::get_magnitude(self.bets[bet]);
            self.player_cash += mag;
            self.clamp_cash();
            self.bets[bet] -= mag;
        }
        0
    }

    pub fn output(&self) -> String {
        let mut out = String::new();
        for i in 0..BETS_LEN {
            out.push_str(&format!("{}\n", self.bets[i]));
        }
        out.push_str(&format!("{}", self.player_cash));
        out
    }
}

#[wasm_bindgen]
pub struct WasmSimulator {
    sim: Simulator,
}

#[wasm_bindgen]
impl WasmSimulator {
    #[wasm_bindgen(constructor)]
    pub fn new(player_cash: i32, casino_credit: i32, max_wager: i32) -> Self {
        Self {
            sim: Simulator::new(player_cash, casino_credit, max_wager),
        }
    }

    pub fn increase_wager(&mut self, bet: usize) -> i32 {
        self.sim.increase_wager(bet)
    }

    pub fn decrease_wager(&mut self, bet: usize) -> i32 {
        self.sim.decrease_wager(bet)
    }

    pub fn output(&self) -> String {
        self.sim.output()
    }
}

#[wasm_bindgen]
pub fn bets_len() -> usize {
    BETS_LEN
}

#[cfg(test)]
mod tests {
    use super::Simulator;

    #[test]
    fn output_reflects_initial_cash() {
        let sim = Simulator::new(-1001, 1000, 100);
        assert_eq!(sim.output(), "0\n0\n0\n0\n0\n0\n-1001");
    }
}
