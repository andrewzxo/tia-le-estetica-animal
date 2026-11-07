/**
 * Gera o snapshot limpo do banco (db/seed.db) para o deploy.
 *
 * - Copia db/custom.db → db/seed.db
 * - Remove os dados pessoais APENAS NA CÓPIA (a fonte nunca é modificada)
 * - VACUUM para apagar fisicamente os registros do arquivo
 *
 * Rode antes de cada deploy: bun scripts/sync-seed-db.mjs
 */
import { copyFileSync, statSync } from 'fs'
import { Database } from 'bun:sqlite'

const SOURCE = '/home/z/my-project/db/custom.db'
const TARGET = '/home/z/my-project/db/seed.db'

// 1. Copia primeiro — nenhuma operação de escrita toca na fonte
copyFileSync(SOURCE, TARGET)

// 2. Limpa dados pessoais apenas no snapshot
const db = new Database(TARGET)
db.exec('DELETE FROM Appointment')
db.exec('DELETE FROM Pet')
db.exec('DELETE FROM Customer')
db.exec('VACUUM') // reconstrói o arquivo, apagando fisicamente os registros

const q = (sql) => db.query(sql).get().c
const counts = {
  servicos: q('SELECT COUNT(*) c FROM Service'),
  galeria: q('SELECT COUNT(*) c FROM GalleryItem'),
  depoimentos: q('SELECT COUNT(*) c FROM Testimonial'),
  horarios: q('SELECT COUNT(*) c FROM WorkingHours'),
  settings: q('SELECT COUNT(*) c FROM SiteSettings'),
  admin: q('SELECT COUNT(*) c FROM AdminUser'),
}
const pessoais = {
  agendamentos: q('SELECT COUNT(*) c FROM Appointment'),
  clientes: q('SELECT COUNT(*) c FROM Customer'),
  pets: q('SELECT COUNT(*) c FROM Pet'),
}
db.close()

// 3. Confere que a fonte permaneceu intacta
const src = new Database(SOURCE, { readonly: true })
const srcClientes = src.query('SELECT COUNT(*) c FROM Customer').get().c
src.close()

const kb = (statSync(TARGET).size / 1024).toFixed(0)
console.log(`✓ db/seed.db gerado (${kb}KB)`)
console.log(`✓ conteúdo no snapshot: ${JSON.stringify(counts)}`)
console.log(`✓ dados pessoais no snapshot: ${JSON.stringify(pessoais)}`)
console.log(`✓ banco original intacto (clientes: ${srcClientes})`)

if (pessoais.clientes !== 0 || pessoais.agendamentos !== 0 || pessoais.pets !== 0) {
  console.error('❌ FALHA: snapshot ainda contém dados pessoais!')
  process.exit(1)
}
if (srcClientes === 0) {
  console.error('❌ FALHA: banco original foi modificado!')
  process.exit(1)
}
console.log('✅ Snapshot limpo pronto para commit/deploy')
