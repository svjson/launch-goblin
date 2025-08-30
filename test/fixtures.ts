export const generateSingleResultTests = <Inputs, Expected>(
  generator: (inputs: Inputs, expected: Expected) => void,
  expected: Expected,
  testCases: Inputs[]
) => {
  for (const testCase of testCases) {
    generator(testCase, expected)
  }
}

export const generateTests = <Inputs>(
  generator: (inputs: Inputs) => void,
  testCases: Inputs[]
) => {
  for (const testCase of testCases) {
    generator(testCase)
  }
}
