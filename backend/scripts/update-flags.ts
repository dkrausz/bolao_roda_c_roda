import prisma from '../src/lib/prisma';

const flags: Record<string, string> = {
  'México':          'mx',
  'África do Sul':   'za',
  'Coreia do Sul':   'kr',
  'Tchéquia':        'cz',
  'Canadá':          'ca',
  'Bósnia':          'ba',
  'Suíça':           'ch',
  'Catar':           'qa',
  'Brasil':          'br',
  'Marrocos':        'ma',
  'Haiti':           'ht',
  'Escócia':         'gb-sct',
  'EUA':             'us',
  'Paraguai':        'py',
  'Austrália':       'au',
  'Turquia':         'tr',
  'Alemanha':        'de',
  'Curaçao':         'cw',
  'Costa do Marfim': 'ci',
  'Equador':         'ec',
  'Holanda':         'nl',
  'Japão':           'jp',
  'Suécia':          'se',
  'Tunísia':         'tn',
  'Bélgica':         'be',
  'Egito':           'eg',
  'Irã':             'ir',
  'Nova Zelândia':   'nz',
  'Espanha':         'es',
  'Cabo Verde':      'cv',
  'Arábia Saudita':  'sa',
  'Uruguai':         'uy',
  'França':          'fr',
  'Senegal':         'sn',
  'Iraque':          'iq',
  'Noruega':         'no',
  'Argentina':       'ar',
  'Argélia':         'dz',
  'Áustria':         'at',
  'Jordânia':        'jo',
  'Portugal':        'pt',
  'RD Congo':        'cd',
  'Uzbequistão':     'uz',
  'Colômbia':        'co',
  'Inglaterra':      'gb-eng',
  'Croácia':         'hr',
  'Gana':            'gh',
  'Panamá':          'pa',
};

async function main() {
  for (const [name, code] of Object.entries(flags)) {
    await prisma.team.updateMany({ where: { name }, data: { flag: code } });
  }
  console.log('Bandeiras atualizadas!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
