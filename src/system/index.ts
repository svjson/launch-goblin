import which from 'which'

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
