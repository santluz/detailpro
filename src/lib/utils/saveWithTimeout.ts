export async function saveWithTimeout<T>(
  promise: Promise<T>,
  onSuccess: () => void,
  onClose: () => void,
  successMsg: string,
  timeoutMs = 8000
): Promise<void> {
  try {
    await Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), timeoutMs)
      ),
    ]);
    const { default: toast } = await import('react-hot-toast');
    toast.success(successMsg);
    onSuccess();
    onClose();
  } catch (err: unknown) {
    const { default: toast } = await import('react-hot-toast');
    if (err instanceof Error && err.message === 'timeout') {
      toast.success(successMsg + ' (sincronizando...)');
      onSuccess();
      onClose();
    } else {
      toast.error('Erro ao salvar. Tente novamente.');
      throw err;
    }
  }
}
