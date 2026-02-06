use wof_simulator_rs::Simulator;

fn main() {
    let sim = Simulator::new(-1001, 1000, 100);
    print!("{}", sim.output());
}
