import { check } from '@tauri-apps/plugin-updater'

export async function checkForUpdates(): Promise<void> {
  try {
    const update = await check()

    if (update) {
      const shouldUpdate = confirm(
        `Nouvelle version disponible: ${update.version}\n\nVoulez-vous mettre à jour maintenant?`
      )

      if (shouldUpdate) {
        showUpdateProgress()

        try {
          await update.downloadAndInstall((progress) => {
            if (progress.event === 'Started' && progress.data.contentLength) {
              console.log(`Téléchargement: ${progress.data.contentLength} bytes`)
            } else if (progress.event === 'Progress') {
              console.log(`Progression: ${progress.data.chunkLength} bytes`)
            } else if (progress.event === 'Finished') {
              console.log('Téléchargement terminé')
            }
          })

          const { relaunch } = await import('@tauri-apps/plugin-process')
          await relaunch()
        } catch (e) {
          removeUpdateOverlay()
          alert(`Échec de la mise à jour: ${e}`)
        }
      }
    }
  } catch (e) {
    console.log('Update check failed (normal in dev):', e)
  }
}

function showUpdateProgress(): void {
  const overlay = document.createElement('div')
  overlay.id = 'update-overlay'
  overlay.innerHTML = `
    <div class="update-dialog">
      <h3>Mise à jour en cours...</h3>
      <p>Téléchargement de la nouvelle version</p>
      <div class="spinner"></div>
    </div>
  `
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `
  const dialog = overlay.querySelector('.update-dialog') as HTMLElement
  dialog.style.cssText = `
    background: #2d2d30;
    padding: 2rem;
    border-radius: 8px;
    text-align: center;
    color: #d4d4d4;
  `
  document.body.appendChild(overlay)
}

function removeUpdateOverlay(): void {
  document.getElementById('update-overlay')?.remove()
}
