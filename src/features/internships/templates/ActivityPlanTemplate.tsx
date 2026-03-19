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

interface PlanProps {
  data: {
    student: Student;
    company: Company;
    school: School;
    internship: Internship;
    supervisor: Supervisor;
    advisor: Advisor;
  };
}

export const ActivityPlanTemplate = ({ data }: PlanProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text>INTERNSHIP ACTIVITY PLAN</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>IDENTIFICATION</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Intern:</Text>
          <Text style={styles.content}>{data.student?.name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Course:</Text>
          <Text style={styles.content}>IT Technician</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Company:</Text>
          <Text style={styles.content}>{data.company?.business_name}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>INTERNSHIP OBJECTIVES</Text>
        <Text>
          Provide the student with the practical application of theoretical
          knowledge acquired in the course, aiming at professional and social
          improvement.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>ACTIVITY DESCRIPTION</Text>
        <Text>• Software development and systems maintenance;</Text>
        <Text>• Configuration and support in computer networks;</Text>
        <Text>• Preventive and corrective hardware maintenance;</Text>
        <Text>• Assistance in database management;</Text>
        <Text>• Specialized technical support to the company's users.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>MONITORING</Text>
        <Text>
          The internship will be directly supervised by {data.supervisor?.name}{" "}
          at the company and advised by {data.advisor?.name} at the educational
          institution.
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.signature}>
          <Text>Advisor</Text>
        </View>
        <View style={styles.signature}>
          <Text>Supervisor</Text>
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
