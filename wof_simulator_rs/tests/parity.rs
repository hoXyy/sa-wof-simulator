use std::path::PathBuf;
use std::process::Command;
use wof_simulator_rs::Simulator;

#[test]
fn c_and_rust_outputs_match() {
    let manifest_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let c_path = manifest_dir.join("..").join("wof_simulator.c");
    let c_bin = std::env::temp_dir().join("wof_simulator_c_bin");

    let clang_status = Command::new("clang")
        .args([c_path.to_string_lossy().as_ref(), "-o", c_bin.to_string_lossy().as_ref()])
        .status()
        .expect("Failed to execute clang");
    assert!(
        clang_status.success(),
        "clang failed to compile C simulator"
    );

    let c_output = Command::new(&c_bin)
        .output()
        .expect("Failed to run C simulator");
    assert!(c_output.status.success(), "C simulator exited non-zero");

    let c_stdout = String::from_utf8(c_output.stdout).expect("C output not valid UTF-8");
    let rust_stdout = Simulator::new(-1001, 1000, 100).output();

    assert_eq!(c_stdout, rust_stdout, "C and Rust outputs differ");
}
