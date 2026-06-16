import { PrismaClient, Phase } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.team.count();
  if (count > 0) {
    console.log('Banco já populado, pulando seed.');
    return;
  }

  console.log('Seeding times...');

  const teams = await prisma.team.createManyAndReturn({
    data: [
      // Grupo A
      { name: 'México',          flag: 'mx',     groupLetter: 'A' },
      { name: 'África do Sul',   flag: 'za',     groupLetter: 'A' },
      { name: 'Coreia do Sul',   flag: 'kr',     groupLetter: 'A' },
      { name: 'Tchéquia',        flag: 'cz',     groupLetter: 'A' },
      // Grupo B
      { name: 'Canadá',          flag: 'ca',     groupLetter: 'B' },
      { name: 'Bósnia',          flag: 'ba',     groupLetter: 'B' },
      { name: 'Suíça',           flag: 'ch',     groupLetter: 'B' },
      { name: 'Catar',           flag: 'qa',     groupLetter: 'B' },
      // Grupo C
      { name: 'Brasil',          flag: 'br',     groupLetter: 'C' },
      { name: 'Marrocos',        flag: 'ma',     groupLetter: 'C' },
      { name: 'Haiti',           flag: 'ht',     groupLetter: 'C' },
      { name: 'Escócia',         flag: 'gb-sct', groupLetter: 'C' },
      // Grupo D
      { name: 'EUA',             flag: 'us',     groupLetter: 'D' },
      { name: 'Paraguai',        flag: 'py',     groupLetter: 'D' },
      { name: 'Austrália',       flag: 'au',     groupLetter: 'D' },
      { name: 'Turquia',         flag: 'tr',     groupLetter: 'D' },
      // Grupo E
      { name: 'Alemanha',        flag: 'de',     groupLetter: 'E' },
      { name: 'Curaçao',         flag: 'cw',     groupLetter: 'E' },
      { name: 'Costa do Marfim', flag: 'ci',     groupLetter: 'E' },
      { name: 'Equador',         flag: 'ec',     groupLetter: 'E' },
      // Grupo F
      { name: 'Holanda',         flag: 'nl',     groupLetter: 'F' },
      { name: 'Japão',           flag: 'jp',     groupLetter: 'F' },
      { name: 'Suécia',          flag: 'se',     groupLetter: 'F' },
      { name: 'Tunísia',         flag: 'tn',     groupLetter: 'F' },
      // Grupo G
      { name: 'Bélgica',         flag: 'be',     groupLetter: 'G' },
      { name: 'Egito',           flag: 'eg',     groupLetter: 'G' },
      { name: 'Irã',             flag: 'ir',     groupLetter: 'G' },
      { name: 'Nova Zelândia',   flag: 'nz',     groupLetter: 'G' },
      // Grupo H
      { name: 'Espanha',         flag: 'es',     groupLetter: 'H' },
      { name: 'Cabo Verde',      flag: 'cv',     groupLetter: 'H' },
      { name: 'Arábia Saudita',  flag: 'sa',     groupLetter: 'H' },
      { name: 'Uruguai',         flag: 'uy',     groupLetter: 'H' },
      // Grupo I
      { name: 'França',          flag: 'fr',     groupLetter: 'I' },
      { name: 'Senegal',         flag: 'sn',     groupLetter: 'I' },
      { name: 'Iraque',          flag: 'iq',     groupLetter: 'I' },
      { name: 'Noruega',         flag: 'no',     groupLetter: 'I' },
      // Grupo J
      { name: 'Argentina',       flag: 'ar',     groupLetter: 'J' },
      { name: 'Argélia',         flag: 'dz',     groupLetter: 'J' },
      { name: 'Áustria',         flag: 'at',     groupLetter: 'J' },
      { name: 'Jordânia',        flag: 'jo',     groupLetter: 'J' },
      // Grupo K
      { name: 'Portugal',        flag: 'pt',     groupLetter: 'K' },
      { name: 'RD Congo',        flag: 'cd',     groupLetter: 'K' },
      { name: 'Uzbequistão',     flag: 'uz',     groupLetter: 'K' },
      { name: 'Colômbia',        flag: 'co',     groupLetter: 'K' },
      // Grupo L
      { name: 'Inglaterra',      flag: 'gb-eng', groupLetter: 'L' },
      { name: 'Croácia',         flag: 'hr',     groupLetter: 'L' },
      { name: 'Gana',            flag: 'gh',     groupLetter: 'L' },
      { name: 'Panamá',          flag: 'pa',     groupLetter: 'L' },
    ],
  });

  const t = Object.fromEntries(teams.map((team) => [team.name, team.id])) as Record<string, number>;

  console.log('Seeding fase de grupos...');

  // Horários em UTC (fonte: worldcupwiki.com, convertido de ET/EDT = UTC-4)
  // Resultados confirmados até 15/06/2026

  type M = {
    matchDate: Date; phase: Phase; groupLetter: string;
    homeTeamId: number; awayTeamId: number;
    homeScore?: number; awayScore?: number;
  };

  const d = (iso: string) => new Date(iso);

  const groupMatches: M[] = [
    // ══════════════════════════════════════════
    // RODADA 1
    // ══════════════════════════════════════════

    // Grupo A — 11/jun — RESULTADOS CONFIRMADOS
    { matchDate: d('2026-06-11T19:00:00Z'), phase: 'group', groupLetter: 'A', homeTeamId: t['México'],        awayTeamId: t['África do Sul'],  homeScore: 2, awayScore: 0 },
    { matchDate: d('2026-06-11T22:00:00Z'), phase: 'group', groupLetter: 'A', homeTeamId: t['Coreia do Sul'], awayTeamId: t['Tchéquia'],       homeScore: 2, awayScore: 1 },

    // Grupo B + D — 12/jun — RESULTADOS CONFIRMADOS
    { matchDate: d('2026-06-12T19:00:00Z'), phase: 'group', groupLetter: 'B', homeTeamId: t['Canadá'],        awayTeamId: t['Bósnia'],         homeScore: 1, awayScore: 1 },
    { matchDate: d('2026-06-12T22:00:00Z'), phase: 'group', groupLetter: 'D', homeTeamId: t['EUA'],           awayTeamId: t['Paraguai'],       homeScore: 4, awayScore: 1 },

    // Grupos B, C, D — 13/jun — RESULTADOS CONFIRMADOS
    { matchDate: d('2026-06-13T19:00:00Z'), phase: 'group', groupLetter: 'B', homeTeamId: t['Catar'],         awayTeamId: t['Suíça'],          homeScore: 1, awayScore: 1 },
    { matchDate: d('2026-06-13T22:00:00Z'), phase: 'group', groupLetter: 'C', homeTeamId: t['Brasil'],        awayTeamId: t['Marrocos'],       homeScore: 1, awayScore: 1 },
    { matchDate: d('2026-06-14T00:00:00Z'), phase: 'group', groupLetter: 'C', homeTeamId: t['Haiti'],         awayTeamId: t['Escócia'],        homeScore: 0, awayScore: 1 },
    { matchDate: d('2026-06-14T03:00:00Z'), phase: 'group', groupLetter: 'D', homeTeamId: t['Austrália'],     awayTeamId: t['Turquia'],        homeScore: 2, awayScore: 0 },

    // Grupos E, F — 14/jun — E confirmado, F sem resultado
    { matchDate: d('2026-06-14T19:00:00Z'), phase: 'group', groupLetter: 'E', homeTeamId: t['Alemanha'],      awayTeamId: t['Curaçao'],        homeScore: 7, awayScore: 1 },
    { matchDate: d('2026-06-14T22:00:00Z'), phase: 'group', groupLetter: 'F', homeTeamId: t['Holanda'],       awayTeamId: t['Japão'] },
    { matchDate: d('2026-06-15T00:00:00Z'), phase: 'group', groupLetter: 'E', homeTeamId: t['Costa do Marfim'], awayTeamId: t['Equador'],      homeScore: 1, awayScore: 0 },
    { matchDate: d('2026-06-15T03:00:00Z'), phase: 'group', groupLetter: 'F', homeTeamId: t['Suécia'],        awayTeamId: t['Tunísia'] },

    // Grupos G, H — 15/jun
    { matchDate: d('2026-06-15T19:00:00Z'), phase: 'group', groupLetter: 'H', homeTeamId: t['Espanha'],       awayTeamId: t['Cabo Verde'] },
    { matchDate: d('2026-06-15T22:00:00Z'), phase: 'group', groupLetter: 'G', homeTeamId: t['Bélgica'],       awayTeamId: t['Egito'] },
    { matchDate: d('2026-06-16T00:00:00Z'), phase: 'group', groupLetter: 'H', homeTeamId: t['Arábia Saudita'], awayTeamId: t['Uruguai'] },
    { matchDate: d('2026-06-16T03:00:00Z'), phase: 'group', groupLetter: 'G', homeTeamId: t['Irã'],           awayTeamId: t['Nova Zelândia'] },

    // Grupos I, J — 16/jun
    { matchDate: d('2026-06-16T19:00:00Z'), phase: 'group', groupLetter: 'I', homeTeamId: t['França'],        awayTeamId: t['Senegal'] },
    { matchDate: d('2026-06-16T22:00:00Z'), phase: 'group', groupLetter: 'I', homeTeamId: t['Iraque'],        awayTeamId: t['Noruega'] },
    { matchDate: d('2026-06-17T01:00:00Z'), phase: 'group', groupLetter: 'J', homeTeamId: t['Argentina'],     awayTeamId: t['Argélia'] },
    { matchDate: d('2026-06-17T04:00:00Z'), phase: 'group', groupLetter: 'J', homeTeamId: t['Áustria'],       awayTeamId: t['Jordânia'] },

    // Grupos K, L — 17/jun
    { matchDate: d('2026-06-17T17:00:00Z'), phase: 'group', groupLetter: 'K', homeTeamId: t['Portugal'],      awayTeamId: t['RD Congo'] },
    { matchDate: d('2026-06-17T20:00:00Z'), phase: 'group', groupLetter: 'L', homeTeamId: t['Inglaterra'],    awayTeamId: t['Croácia'] },
    { matchDate: d('2026-06-17T23:00:00Z'), phase: 'group', groupLetter: 'L', homeTeamId: t['Gana'],          awayTeamId: t['Panamá'] },
    { matchDate: d('2026-06-18T02:00:00Z'), phase: 'group', groupLetter: 'K', homeTeamId: t['Uzbequistão'],   awayTeamId: t['Colômbia'] },

    // ══════════════════════════════════════════
    // RODADA 2
    // ══════════════════════════════════════════

    // Grupos A, B — 18/jun
    { matchDate: d('2026-06-18T16:00:00Z'), phase: 'group', groupLetter: 'A', homeTeamId: t['Tchéquia'],      awayTeamId: t['África do Sul'] },
    { matchDate: d('2026-06-18T19:00:00Z'), phase: 'group', groupLetter: 'B', homeTeamId: t['Suíça'],         awayTeamId: t['Bósnia'] },
    { matchDate: d('2026-06-18T22:00:00Z'), phase: 'group', groupLetter: 'B', homeTeamId: t['Canadá'],        awayTeamId: t['Catar'] },
    { matchDate: d('2026-06-19T01:00:00Z'), phase: 'group', groupLetter: 'A', homeTeamId: t['México'],        awayTeamId: t['Coreia do Sul'] },

    // Grupos C, D — 19/jun
    { matchDate: d('2026-06-19T19:00:00Z'), phase: 'group', groupLetter: 'D', homeTeamId: t['EUA'],           awayTeamId: t['Austrália'] },
    { matchDate: d('2026-06-19T22:00:00Z'), phase: 'group', groupLetter: 'C', homeTeamId: t['Escócia'],       awayTeamId: t['Marrocos'] },
    { matchDate: d('2026-06-20T00:30:00Z'), phase: 'group', groupLetter: 'C', homeTeamId: t['Brasil'],        awayTeamId: t['Haiti'] },
    { matchDate: d('2026-06-20T03:00:00Z'), phase: 'group', groupLetter: 'D', homeTeamId: t['Turquia'],       awayTeamId: t['Paraguai'] },

    // Grupos E, F — 20/jun
    { matchDate: d('2026-06-20T17:00:00Z'), phase: 'group', groupLetter: 'F', homeTeamId: t['Holanda'],       awayTeamId: t['Suécia'] },
    { matchDate: d('2026-06-20T20:00:00Z'), phase: 'group', groupLetter: 'E', homeTeamId: t['Alemanha'],      awayTeamId: t['Costa do Marfim'] },
    { matchDate: d('2026-06-21T00:00:00Z'), phase: 'group', groupLetter: 'E', homeTeamId: t['Equador'],       awayTeamId: t['Curaçao'] },
    { matchDate: d('2026-06-21T04:00:00Z'), phase: 'group', groupLetter: 'F', homeTeamId: t['Tunísia'],       awayTeamId: t['Japão'] },

    // Grupos G, H — 21/jun
    { matchDate: d('2026-06-21T16:00:00Z'), phase: 'group', groupLetter: 'H', homeTeamId: t['Espanha'],       awayTeamId: t['Arábia Saudita'] },
    { matchDate: d('2026-06-21T19:00:00Z'), phase: 'group', groupLetter: 'G', homeTeamId: t['Bélgica'],       awayTeamId: t['Irã'] },
    { matchDate: d('2026-06-21T22:00:00Z'), phase: 'group', groupLetter: 'H', homeTeamId: t['Uruguai'],       awayTeamId: t['Cabo Verde'] },
    { matchDate: d('2026-06-22T01:00:00Z'), phase: 'group', groupLetter: 'G', homeTeamId: t['Nova Zelândia'], awayTeamId: t['Egito'] },

    // Grupos I, J — 22/jun
    { matchDate: d('2026-06-22T17:00:00Z'), phase: 'group', groupLetter: 'J', homeTeamId: t['Argentina'],     awayTeamId: t['Áustria'] },
    { matchDate: d('2026-06-22T21:00:00Z'), phase: 'group', groupLetter: 'I', homeTeamId: t['França'],        awayTeamId: t['Iraque'] },
    { matchDate: d('2026-06-23T00:00:00Z'), phase: 'group', groupLetter: 'I', homeTeamId: t['Noruega'],       awayTeamId: t['Senegal'] },
    { matchDate: d('2026-06-23T03:00:00Z'), phase: 'group', groupLetter: 'J', homeTeamId: t['Jordânia'],      awayTeamId: t['Argélia'] },

    // Grupos K, L — 23/jun
    { matchDate: d('2026-06-23T17:00:00Z'), phase: 'group', groupLetter: 'K', homeTeamId: t['Portugal'],      awayTeamId: t['Uzbequistão'] },
    { matchDate: d('2026-06-23T20:00:00Z'), phase: 'group', groupLetter: 'L', homeTeamId: t['Inglaterra'],    awayTeamId: t['Gana'] },
    { matchDate: d('2026-06-23T23:00:00Z'), phase: 'group', groupLetter: 'L', homeTeamId: t['Panamá'],        awayTeamId: t['Croácia'] },
    { matchDate: d('2026-06-24T02:00:00Z'), phase: 'group', groupLetter: 'K', homeTeamId: t['Colômbia'],      awayTeamId: t['RD Congo'] },

    // ══════════════════════════════════════════
    // RODADA 3 (simultâneos por grupo)
    // ══════════════════════════════════════════

    // Grupos B, C — 24/jun
    { matchDate: d('2026-06-24T19:00:00Z'), phase: 'group', groupLetter: 'B', homeTeamId: t['Suíça'],         awayTeamId: t['Canadá'] },
    { matchDate: d('2026-06-24T19:00:00Z'), phase: 'group', groupLetter: 'B', homeTeamId: t['Bósnia'],        awayTeamId: t['Catar'] },
    { matchDate: d('2026-06-24T22:00:00Z'), phase: 'group', groupLetter: 'C', homeTeamId: t['Escócia'],       awayTeamId: t['Brasil'] },
    { matchDate: d('2026-06-24T22:00:00Z'), phase: 'group', groupLetter: 'C', homeTeamId: t['Marrocos'],      awayTeamId: t['Haiti'] },

    // Grupo A — 25/jun (9pm ET 24/jun)
    { matchDate: d('2026-06-25T01:00:00Z'), phase: 'group', groupLetter: 'A', homeTeamId: t['Tchéquia'],      awayTeamId: t['México'] },
    { matchDate: d('2026-06-25T01:00:00Z'), phase: 'group', groupLetter: 'A', homeTeamId: t['África do Sul'], awayTeamId: t['Coreia do Sul'] },

    // Grupos E, F, D — 25/jun
    { matchDate: d('2026-06-25T20:00:00Z'), phase: 'group', groupLetter: 'E', homeTeamId: t['Curaçao'],       awayTeamId: t['Costa do Marfim'] },
    { matchDate: d('2026-06-25T20:00:00Z'), phase: 'group', groupLetter: 'E', homeTeamId: t['Equador'],       awayTeamId: t['Alemanha'] },
    { matchDate: d('2026-06-25T23:00:00Z'), phase: 'group', groupLetter: 'F', homeTeamId: t['Japão'],         awayTeamId: t['Suécia'] },
    { matchDate: d('2026-06-25T23:00:00Z'), phase: 'group', groupLetter: 'F', homeTeamId: t['Tunísia'],       awayTeamId: t['Holanda'] },
    { matchDate: d('2026-06-26T02:00:00Z'), phase: 'group', groupLetter: 'D', homeTeamId: t['Turquia'],       awayTeamId: t['EUA'] },
    { matchDate: d('2026-06-26T02:00:00Z'), phase: 'group', groupLetter: 'D', homeTeamId: t['Paraguai'],      awayTeamId: t['Austrália'] },

    // Grupos I, H, G — 26/jun
    { matchDate: d('2026-06-26T19:00:00Z'), phase: 'group', groupLetter: 'I', homeTeamId: t['Noruega'],       awayTeamId: t['França'] },
    { matchDate: d('2026-06-26T19:00:00Z'), phase: 'group', groupLetter: 'I', homeTeamId: t['Senegal'],       awayTeamId: t['Iraque'] },
    { matchDate: d('2026-06-27T00:00:00Z'), phase: 'group', groupLetter: 'H', homeTeamId: t['Cabo Verde'],    awayTeamId: t['Arábia Saudita'] },
    { matchDate: d('2026-06-27T00:00:00Z'), phase: 'group', groupLetter: 'H', homeTeamId: t['Uruguai'],       awayTeamId: t['Espanha'] },
    { matchDate: d('2026-06-27T03:00:00Z'), phase: 'group', groupLetter: 'G', homeTeamId: t['Egito'],         awayTeamId: t['Irã'] },
    { matchDate: d('2026-06-27T03:00:00Z'), phase: 'group', groupLetter: 'G', homeTeamId: t['Nova Zelândia'], awayTeamId: t['Bélgica'] },

    // Grupos L, K, J — 27/jun
    { matchDate: d('2026-06-27T21:00:00Z'), phase: 'group', groupLetter: 'L', homeTeamId: t['Panamá'],        awayTeamId: t['Inglaterra'] },
    { matchDate: d('2026-06-27T21:00:00Z'), phase: 'group', groupLetter: 'L', homeTeamId: t['Croácia'],       awayTeamId: t['Gana'] },
    { matchDate: d('2026-06-27T23:30:00Z'), phase: 'group', groupLetter: 'K', homeTeamId: t['Colômbia'],      awayTeamId: t['Portugal'] },
    { matchDate: d('2026-06-27T23:30:00Z'), phase: 'group', groupLetter: 'K', homeTeamId: t['RD Congo'],      awayTeamId: t['Uzbequistão'] },
    { matchDate: d('2026-06-28T02:00:00Z'), phase: 'group', groupLetter: 'J', homeTeamId: t['Argélia'],       awayTeamId: t['Áustria'] },
    { matchDate: d('2026-06-28T02:00:00Z'), phase: 'group', groupLetter: 'J', homeTeamId: t['Jordânia'],      awayTeamId: t['Argentina'] },
  ];

  await prisma.match.createMany({ data: groupMatches });

  console.log('Seeding fase eliminatória...');

  const knockoutMatches: { matchDate: Date; phase: Phase }[] = [
    // Oitavas (16 jogos, 28/jun–4/jul)
    { matchDate: d('2026-06-28T19:00:00Z'), phase: 'round_of_32' },
    { matchDate: d('2026-06-28T22:00:00Z'), phase: 'round_of_32' },
    { matchDate: d('2026-06-29T01:00:00Z'), phase: 'round_of_32' },
    { matchDate: d('2026-06-29T19:00:00Z'), phase: 'round_of_32' },
    { matchDate: d('2026-06-29T22:00:00Z'), phase: 'round_of_32' },
    { matchDate: d('2026-06-30T01:00:00Z'), phase: 'round_of_32' },
    { matchDate: d('2026-06-30T19:00:00Z'), phase: 'round_of_32' },
    { matchDate: d('2026-06-30T22:00:00Z'), phase: 'round_of_32' },
    { matchDate: d('2026-07-01T01:00:00Z'), phase: 'round_of_32' },
    { matchDate: d('2026-07-01T19:00:00Z'), phase: 'round_of_32' },
    { matchDate: d('2026-07-01T22:00:00Z'), phase: 'round_of_32' },
    { matchDate: d('2026-07-02T01:00:00Z'), phase: 'round_of_32' },
    { matchDate: d('2026-07-02T19:00:00Z'), phase: 'round_of_32' },
    { matchDate: d('2026-07-02T22:00:00Z'), phase: 'round_of_32' },
    { matchDate: d('2026-07-03T01:00:00Z'), phase: 'round_of_32' },
    { matchDate: d('2026-07-03T19:00:00Z'), phase: 'round_of_32' },
    // Quartas (8 jogos, 4-7/jul)
    { matchDate: d('2026-07-04T19:00:00Z'), phase: 'round_of_16' },
    { matchDate: d('2026-07-04T22:00:00Z'), phase: 'round_of_16' },
    { matchDate: d('2026-07-05T19:00:00Z'), phase: 'round_of_16' },
    { matchDate: d('2026-07-05T22:00:00Z'), phase: 'round_of_16' },
    { matchDate: d('2026-07-06T19:00:00Z'), phase: 'round_of_16' },
    { matchDate: d('2026-07-06T22:00:00Z'), phase: 'round_of_16' },
    { matchDate: d('2026-07-07T19:00:00Z'), phase: 'round_of_16' },
    { matchDate: d('2026-07-07T22:00:00Z'), phase: 'round_of_16' },
    // Semifinais (4 jogos, 9-11/jul)
    { matchDate: d('2026-07-09T22:00:00Z'), phase: 'quarterfinal' },
    { matchDate: d('2026-07-10T01:00:00Z'), phase: 'quarterfinal' },
    { matchDate: d('2026-07-10T22:00:00Z'), phase: 'quarterfinal' },
    { matchDate: d('2026-07-11T01:00:00Z'), phase: 'quarterfinal' },
    // Finais (14-15/jul)
    { matchDate: d('2026-07-14T22:00:00Z'), phase: 'semifinal' },
    { matchDate: d('2026-07-15T22:00:00Z'), phase: 'semifinal' },
    // 3º lugar e Final
    { matchDate: d('2026-07-18T22:00:00Z'), phase: 'bronze' },
    { matchDate: d('2026-07-19T22:00:00Z'), phase: 'final' },
  ];

  await prisma.match.createMany({ data: knockoutMatches });

  console.log('Seed concluído!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
