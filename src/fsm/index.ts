// states: state and its events
// initial: initial state
function createMachine({ initial, states }) {
  const machine = {
    initialState: initial,
    transition: (state, event) => states[state].on[event],
  };
  return machine;
}
