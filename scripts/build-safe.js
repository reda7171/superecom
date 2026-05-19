const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const MAX_RETRIES = 3;

function cleanNextDir() {
    const nextDir = path.join(process.cwd(), '.next');
    if (fs.existsSync(nextDir)) {
        console.log('🧹 Suppression du dossier .next...');
        try {
            fs.rmSync(nextDir, { recursive: true, force: true });
            console.log('✅ Dossier .next supprimé.');
        } catch (err) {
            console.error('❌ Impossible de supprimer .next:', err.message);
        }
    }
}

function runBuild() {
    console.log('🚀 Démarrage du build Next.js...');
    try {
        execSync('npm run build', { stdio: 'inherit' });
        return true;
    } catch (error) {
        return false;
    }
}

function main() {
    let attempts = 0;
    let success = false;

    while (attempts < MAX_RETRIES && !success) {
        attempts++;
        console.log(`\n🔄 Tentative de build ${attempts}/${MAX_RETRIES}...`);
        
        success = runBuild();

        if (!success) {
            console.log(`⚠️ Tentative ${attempts} échouée. Application des correctifs de build...`);
            
            // Correctifs automatiques de base
            cleanNextDir();
            
            // Suppression du cache Turbopack s'il y a lieu
            const cacheDir = path.join(process.cwd(), 'node_modules', '.cache');
            if (fs.existsSync(cacheDir)) {
                console.log('🧹 Nettoyage du cache de dépendances...');
                try {
                    fs.rmSync(cacheDir, { recursive: true, force: true });
                } catch (e) {}
            }
        }
    }

    if (success) {
        console.log('\n🎉 Le projet a été compilé avec succès !');
        process.exit(0);
    } else {
        console.error('\n❌ Échec persistant du build après plusieurs tentatives.');
        process.exit(1);
    }
}

main();
