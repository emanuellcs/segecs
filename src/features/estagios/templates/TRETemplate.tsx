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

interface TREProps {
  data: {
    aluno: Aluno;
    empresa: Empresa;
    escola: Escola;
    estagio: Estagio;
    supervisor: Supervisor;
    orientador: Orientador;
  };
}

export const TRETemplate = ({ data }: TREProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text>TERMO DE REALIZAÇÃO DE ESTÁGIO (TRE)</Text>
      </View>

      <View style={styles.section}>
        <Text>
          A empresa {data.empresa?.razao_social}, inscrita no CNPJ sob o nº{" "}
          {data.empresa?.cnpj}, declara para os devidos fins que o estudante{" "}
          {data.aluno?.nome}, portador do CPF {data.aluno?.cpf}, realizou o
          Estágio Curricular Supervisionado nesta organização.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>RESUMO DO PERÍODO</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Início:</Text>
          <Text style={styles.content}>
            {new Date(data.estagio?.data_inicio).toLocaleDateString("pt-BR")}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Término:</Text>
          <Text style={styles.content}>
            {new Date(data.estagio?.data_fim).toLocaleDateString("pt-BR")}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Carga Horária:</Text>
          <Text style={styles.content}>
            {data.estagio?.carga_horaria_total} horas totais
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>AVALIAÇÃO FINAL</Text>
        <Text>
          O estagiário cumpriu satisfatoriamente as atividades previstas em seu
          Plano de Atividades, demonstrando competência técnica e compromisso
          profissional durante todo o período de vivência prática.
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.signature}>
          <Text>Representante da Empresa</Text>
        </View>
        <View style={styles.signature}>
          <Text>Coordenador de Estágios</Text>
        </View>
      </View>

      <Text
        style={{
          marginTop: 20,
          textAlign: "center",
          fontSize: 8,
          color: "#666",
        }}
      >
        Gerado automaticamente pelo SEGECS em{" "}
        {new Date().toLocaleDateString("pt-BR")}
      </Text>
    </Page>
  </Document>
);
