import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    textDecoration: 'underline',
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 10,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 5,
    backgroundColor: '#f0f0f0',
    padding: 3,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
    paddingVertical: 3,
  },
  label: {
    width: 100,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  footer: {
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  signature: {
    borderTopWidth: 1,
    borderTopColor: '#000',
    width: 150,
    textAlign: 'center',
    paddingTop: 5,
  }
});

interface TCEProps {
  data: {
    aluno: any;
    empresa: any;
    escola: any;
    estagio: any;
    supervisor: any;
    orientador: any;
  };
}

export const TCETemplate = ({ data }: TCEProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text>Termo de Compromisso de Estágio (TCE)</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>1. IDENTIFICAÇÃO DAS PARTES</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Instituição:</Text>
          <Text style={styles.content}>{data.escola?.nome}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Concedente:</Text>
          <Text style={styles.content}>{data.empresa?.razao_social} - CNPJ: {data.empresa?.cnpj}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Estagiário:</Text>
          <Text style={styles.content}>{data.aluno?.nome} - CPF: {data.aluno?.cpf}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>2. DO ESTÁGIO</Text>
        <Text>
          O estágio terá duração de {data.estagio?.carga_horaria_total} horas, com início em {new Date(data.estagio?.data_inicio).toLocaleDateString('pt-BR')} e término em {new Date(data.estagio?.data_fim).toLocaleDateString('pt-BR')}, respeitando a jornada de {data.estagio?.carga_horaria_diaria} horas diárias.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>3. PLANO DE ATIVIDADES (TÉCNICO EM INFORMÁTICA)</Text>
        <Text>• Manutenção de computadores e redes;</Text>
        <Text>• Suporte técnico ao usuário;</Text>
        <Text>• Desenvolvimento e manutenção de sistemas/sites;</Text>
        <Text>• Gestão de banco de dados e infraestrutura.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>4. RESPONSÁVEIS</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Orientador:</Text>
          <Text style={styles.content}>{data.orientador?.nome}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Supervisor:</Text>
          <Text style={styles.content}>{data.supervisor?.nome} ({data.supervisor?.cargo})</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.signature}>
          <Text>Escola</Text>
        </View>
        <View style={styles.signature}>
          <Text>Empresa</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <View style={styles.signature}>
          <Text>Estagiário</Text>
        </View>
      </View>
    </Page>
  </Document>
);
