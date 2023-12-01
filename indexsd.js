const { createClient } = require("@supabase/supabase-js"); // 데이터 소스 적용하려다 실패함....또 도전을....!!!
const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");

const supabaseUrl = "https://yvayyzbfvawhlxqoarkx.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2YXl5emJmdmF3aGx4cW9hcmt4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMDc5OTM2MiwiZXhwIjoyMDE2Mzc1MzYyfQ.x6X_AZ3f2pmV_1cFbF5vhnbGUiEZ7l8bqbCcU-FPKgI";
const supabase = createClient(supabaseUrl, supabaseKey);

class MemberAPI {
  async getMembers() {
    const { data, error } = await supabase.from("Member").select("*");
    return data;
  }

  async getMemberByNo(no) {
    const { data, error } = await supabase
      .from("Member")
      .select("*")
      .eq("no", no);
    return data[0];
  }
}

class RoleAPI {
  async getRoles() {
    const { data, error } = await supabase.from("Role").select("*");
    return data;
  }

  async getRoleById(id) {
    const { data, error } = await supabase
      .from("Role")
      .select("*")
      .eq("id", id);
    return data[0];
  }

  async getMembersByRoleId(id) {
    const { data, error } = await supabase
      .from("Member")
      .select("*")
      .eq("role_id", id);
    return data;
  }
}

class JobTitleAPI {
  async getJobTitles() {
    const { data, error } = await supabase.from("JobTitle").select("*");
    return data;
  }

  async getJobTitleById(id) {
    const { data, error } = await supabase
      .from("JobTitle")
      .select("*")
      .eq("id", id);
    return data[0];
  }

  async getMembersByJobTitleId(id) {
    const { data, error } = await supabase
      .from("Member")
      .select("*")
      .eq("job_title_id", id);
    return data;
  }
}

const typeDefs = `
  type Member {
    id: Int
    no: String
    name: String
    role: Role
    profile_img: String
    gender: String
    birthday: String
    job_start_year: String
    joined_year: String
    jobTitle: JobTitle
  }

  type Role {
    id: Int
    name: String
    members: [Member]
  }

  type JobTitle {
    id: Int
    name: String
    members: [Member]
  }

  type Query {
    members: [Member]
    member(no: String): Member
    roles: [Role]
    role(id: Int): Role
    jobTitles: [JobTitle]
    jobTitle(id: Int): JobTitle
  }
`;

const resolvers = {
  Query: {
    members: (_, __, { dataSources }) => dataSources.memberAPI.getMembers(),
    member: (_, { no }, { dataSources }) =>
      dataSources.memberAPI.getMemberByNo(no),
    roles: (_, __, { dataSources }) => dataSources.roleAPI.getRoles(),
    role: (_, { id }, { dataSources }) => dataSources.roleAPI.getRoleById(id),
    jobTitles: (_, __, { dataSources }) =>
      dataSources.jobTitleAPI.getJobTitles(),
    jobTitle: (_, { id }, { dataSources }) =>
      dataSources.jobTitleAPI.getJobTitleById(id),
  },
  Role: {
    members: (parent, _, { dataSources }) =>
      dataSources.roleAPI.getMembersByRoleId(parent.id),
  },
  JobTitle: {
    members: (parent, _, { dataSources }) =>
      dataSources.jobTitleAPI.getMembersByJobTitleId(parent.id),
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({
    memberAPI: new MemberAPI(),
    roleAPI: new RoleAPI(),
    jobTitleAPI: new JobTitleAPI(),
  }),
});

(async () => {
  try {
    const { url } = await startStandaloneServer(server, {
      listen: { port: 4000 },
    });
    console.log(`🚀  Server ready at: ${url}`);
  } catch (e) {
    console.log(e);
  }
})();
