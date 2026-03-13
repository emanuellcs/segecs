import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import {
  Student,
  Company,
  School,
  Internship,
  Supervisor,
  Advisor,
} from "@/types/database";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
    textDecoration: "underline",
    textTransform: "uppercase",
  },
  section: {
    marginBottom: 10,
  },
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
  label: {
    width: 100,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  footer: {
    marginTop: 50,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  signature: {
    borderTopWidth: 1,
    borderTopColor: "#000",
    width: 150,
    textAlign: "center",
    paddingTop: 5,
  },
});

interface TCEProps {
  data: {
    student: Student;
    company: Company;
    school: School;
    internship: Internship;
    supervisor: Supervisor;
    advisor: Advisor;
  };
}

export const TCETemplate = ({ data }: TCEProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text>Internship Commitment Term (TCE)</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>1. IDENTIFICATION OF PARTIES</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Institution:</Text>
          <Text style={styles.content}>{data.school?.name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Granting Party:</Text>
          <Text style={styles.content}>
            {data.company?.business_name} - CNPJ: {data.company?.cnpj}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Intern:</Text>
          <Text style={styles.content}>
            {data.student?.name} - CPF: {data.student?.cpf}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>2. ABOUT THE INTERNSHIP</Text>
        <Text>
          The internship will have a duration of{" "}
          {data.internship?.total_workload} hours, starting on{" "}
          {new Date(data.internship?.start_date).toLocaleDateString("en-US")}{" "}
          and ending on{" "}
          {new Date(data.internship?.end_date).toLocaleDateString("en-US")},
          respecting the workload of {data.internship?.daily_workload} daily
          hours.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>3. ACTIVITY PLAN (IT TECHNICIAN)</Text>
        <Text>• Computer and network maintenance;</Text>
        <Text>• User technical support;</Text>
        <Text>• Systems/sites development and maintenance;</Text>
        <Text>• Database and infrastructure management.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>4. RESPONSIBLE PARTIES</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Advisor:</Text>
          <Text style={styles.content}>{data.advisor?.name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Supervisor:</Text>
          <Text style={styles.content}>
            {data.supervisor?.name} ({data.supervisor?.position})
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.signature}>
          <Text>School</Text>
        </View>
        <View style={styles.signature}>
          <Text>Company</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <View style={styles.signature}>
          <Text>Intern</Text>
        </View>
      </View>
    </Page>
  </Document>
);
