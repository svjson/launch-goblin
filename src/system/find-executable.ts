import which from 'which'

/**
 * Locate the executable file `bin` on the host system.
 *
 * @param bin - The name of the executable to find.
 *
 * @return The full path to the executable if found, otherwise `undefined`.
 */
export const findExecutable = async (
  bin: string
): Promise<string | undefined> => {
  try {
    const binPath = await which(bin)
    return binPath
  } catch {
    return undefined
  }
}
