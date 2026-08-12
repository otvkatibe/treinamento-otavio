import { describe, expect, it } from 'vitest';

import {
  CONTRACT_DECISIONS,
  CONTRACT_FIELD_NAMES,
  CORRECTION_FIELD_NAMES,
  PERSONAL_FIELD_NAMES,
  REGISTRATION_DECISIONS,
  REGISTRATION_FIELD_NAMES,
  STAGE_CONTRACTS,
  ZEEV_FIELD_CONTRACTS,
} from '../domain-contracts';
import type { StageFieldRule, ZeevFieldName } from '../types';
import {
  EXPECTED_CONTRACT_FIELD_NAMES,
  EXPECTED_CORRECTION_FIELD_NAMES,
  EXPECTED_FIELD_NAMES,
  EXPECTED_PERSONAL_FIELD_NAMES,
  EXPECTED_REGISTRATION_FIELD_NAMES,
  EXPECTED_STAGE_FIXTURES,
  type ExpectedStageFixture,
} from './fixtures/stage-contracts.fixture';

const FIELD_BUCKETS = [
  ['requiredEdit', { access: 'edit', presence: 'required' }],
  ['requiredRead', { access: 'read', presence: 'required' }],
  ['optionalEdit', { access: 'edit', presence: 'optional' }],
  ['optionalRead', { access: 'read', presence: 'optional' }],
  ['notApplicable', { access: 'hidden', presence: 'not-applicable' }],
] as const satisfies readonly [
  keyof ExpectedStageFixture['fields'],
  StageFieldRule,
][];

function expectedFieldMatrix(
  fixture: ExpectedStageFixture,
): Readonly<Record<ZeevFieldName, StageFieldRule>> {
  return Object.fromEntries(
    FIELD_BUCKETS.flatMap(([bucket, rule]) =>
      fixture.fields[bucket].map((name) => [name, rule]),
    ),
  ) as Record<ZeevFieldName, StageFieldRule>;
}

describe('contratos de domínio Zeev', () => {
  it('mantém uma fixture literal que classifica os 17 campos exatamente uma vez por stage', () => {
    for (const fixture of Object.values(EXPECTED_STAGE_FIXTURES)) {
      const classifiedFields = FIELD_BUCKETS.flatMap(([bucket]) =>
        fixture.fields[bucket].map((name) => name),
      );

      expect(classifiedFields).toHaveLength(EXPECTED_FIELD_NAMES.length);
      expect(new Set(classifiedFields)).toHaveLength(EXPECTED_FIELD_NAMES.length);
      expect([...classifiedFields].sort()).toEqual(
        [...EXPECTED_FIELD_NAMES].sort(),
      );
    }
  });

  it('confronta metadados, raias, executores e condicionalidade com a fixture', () => {
    expect(Object.keys(STAGE_CONTRACTS)).toEqual(
      Object.keys(EXPECTED_STAGE_FIXTURES),
    );

    for (const fixture of Object.values(EXPECTED_STAGE_FIXTURES)) {
      expect(STAGE_CONTRACTS[fixture.code]).toMatchObject({
        code: fixture.code,
        kind: fixture.kind,
        title: fixture.title,
        lane: fixture.lane,
        executableRoles: fixture.executableRoles,
        conditional: fixture.conditional,
      });
    }
  });

  it('confronta access e presence dos 17 campos de cada stage com a fixture', () => {
    for (const fixture of Object.values(EXPECTED_STAGE_FIXTURES)) {
      expect(STAGE_CONTRACTS[fixture.code].fields).toEqual(
        expectedFieldMatrix(fixture),
      );
    }
  });

  it('verifica as listas exportadas contra valores literais independentes', () => {
    expect(PERSONAL_FIELD_NAMES).toEqual(EXPECTED_PERSONAL_FIELD_NAMES);
    expect(REGISTRATION_FIELD_NAMES).toEqual(
      EXPECTED_REGISTRATION_FIELD_NAMES,
    );
    expect(CORRECTION_FIELD_NAMES).toEqual(EXPECTED_CORRECTION_FIELD_NAMES);
    expect(CONTRACT_FIELD_NAMES).toEqual(EXPECTED_CONTRACT_FIELD_NAMES);
    expect(Object.keys(ZEEV_FIELD_CONTRACTS)).toEqual(EXPECTED_FIELD_NAMES);
  });

  it('preserva os contratos estruturais de arquivo e endereço', () => {
    expect(ZEEV_FIELD_CONTRACTS.documentoCadastroPdf.kind).toBe(
      'file-or-viewer',
    );
    expect(ZEEV_FIELD_CONTRACTS.documentoContratoPdf.kind).toBe(
      'file-or-viewer',
    );
    expect(REGISTRATION_FIELD_NAMES).toContain('cepEndereco');
    expect(REGISTRATION_FIELD_NAMES).toContain('numeroEndereco');
  });

  it('preserva documentoCadastroPdf required/edit e correcaoRealizada optional/edit em T3', () => {
    expect(STAGE_CONTRACTS.T3.fields.documentoCadastroPdf).toEqual({
      access: 'edit',
      presence: 'required',
    });
    expect(STAGE_CONTRACTS.T3.fields.correcaoRealizada).toEqual({
      access: 'edit',
      presence: 'optional',
    });
  });

  it('reflete a editabilidade exportada sem alterar presence', () => {
    for (const name of EXPECTED_PERSONAL_FIELD_NAMES) {
      expect(STAGE_CONTRACTS.T1.fields[name]).toEqual({
        access: 'edit',
        presence: 'optional',
      });
    }
    for (const name of EXPECTED_REGISTRATION_FIELD_NAMES) {
      expect(STAGE_CONTRACTS.T1.fields[name]).toEqual({
        access: 'edit',
        presence: 'required',
      });
    }

    expect(STAGE_CONTRACTS.T2.fields.documentoCadastroPdf).toEqual({
      access: 'edit',
      presence: 'required',
    });
    EXPECTED_REGISTRATION_FIELD_NAMES.filter(
      (name) => name !== 'documentoCadastroPdf',
    ).forEach((name) => {
      expect(STAGE_CONTRACTS.T2.fields[name]).toEqual({
        access: 'read',
        presence: 'required',
      });
    });

    expect(STAGE_CONTRACTS.T4.fields.documentoCadastroPdf).toEqual({
      access: 'edit',
      presence: 'optional',
    });
    for (const name of EXPECTED_CONTRACT_FIELD_NAMES) {
      expect(STAGE_CONTRACTS.T4.fields[name]).toEqual({
        access: 'edit',
        presence: 'required',
      });
    }

    expect(
      Object.values(STAGE_CONTRACTS.T5.fields).filter(
        ({ access }) => access === 'edit',
      ),
    ).toHaveLength(0);
  });

  it('confronta as ações nativas e sua ordem com os labels literais', () => {
    for (const fixture of Object.values(EXPECTED_STAGE_FIXTURES)) {
      expect(
        STAGE_CONTRACTS[fixture.code].decisions.map(({ zeevLabel }) =>
          zeevLabel,
        ),
      ).toEqual(fixture.actions);
    }

    expect(REGISTRATION_DECISIONS.map(({ zeevLabel }) => zeevLabel)).toEqual(
      EXPECTED_STAGE_FIXTURES.T2.actions,
    );
    expect(CONTRACT_DECISIONS.map(({ zeevLabel }) => zeevLabel)).toEqual(
      EXPECTED_STAGE_FIXTURES.T5.actions,
    );
  });
});
