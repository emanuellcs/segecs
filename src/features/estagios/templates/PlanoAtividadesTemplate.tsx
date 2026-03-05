import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import {
  Aluno,
  Empresa,
  Escola,
  Estagio,
  Supervisor,
  Orientador,
} from "@/types/database";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", lineHeight: 1.5 },
  header: {
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
    textDecoration: "underline",
  },
  section: { marginBottom: 15 },
  title: {
    fontWeight: "bold",
    marginBottom: 5,
    backgroundColor: "#f0f0f0",
    padding: 3,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
    paddingVertical: 3,
  },
  label: { width: 120, fontWeight: "bold" },
  content: { flex: 1 },
  footer: {
    marginTop: 50,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  signature: {
    borderTopWidth: 1,
    borderTopColor: "#000",
    width: 180,
    textAlign: "center",
    paddingTop: 5,
  },
});

interface PlanoProps {
  data: {
    aluno: Aluno;
    empresa: Empresa;
    escola: Escola;
    estagio: Estagio;
    supervisor: Supervisor;
    orientador: Orientador;
  };
}

export const PlanoAtividadesTemplate = ({ data }: PlanoProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text>PLANO DE ATIVIDADES DE ESTÁGIO</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>IDENTIFICAÇÃO</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Estagiário:</Text>
          <Text style={styles.content}>{data.aluno?.nome}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Curso:</Text>
          <Text style={styles.content}>Técnico em Informática</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Empresa:</Text>
          <Text style={styles.content}>{data.empresa?.razao_social}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>OBJETIVOS DO ESTÁGIO</Text>
        <Text>
          Proporcionar ao estudante a aplicação prática dos conhecimentos
          teóricos adquiridos no curso, visando o aperfeiçoamento profissional e
          social.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>DESCRIÇÃO DAS ATIVIDADES</Text>
        <Text>• Desenvolvimento de software e manutenção de sistemas;</Text>
        <Text>• Configuração e suporte em redes de computadores;</Text>
        <Text>• Manutenção preventiva e corretiva de hardware;</Text>
        <Text>• Auxílio na gestão de banco de dados;</Text>
        <Text>• Suporte técnico especializado aos usuários da empresa.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>ACOMPANHAMENTO</Text>
        <Text>
          O estágio será supervisionado diretamente por {data.supervisor?.nome}{" "}
          na empresa e orientado por {data.orientador?.nome} na instituição de
          ensino.
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.signature}>
          <Text>Orientador</Text>
        </View>
        <View style={styles.signature}>
          <Text>Supervisor</Text>
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
