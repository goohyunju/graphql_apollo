const { createClient } = require("@supabase/supabase-js");
const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");

const supabaseUrl = "https://yvayyzbfvawhlxqoarkx.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2YXl5emJmdmF3aGx4cW9hcmt4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMDc5OTM2MiwiZXhwIjoyMDE2Mzc1MzYyfQ.x6X_AZ3f2pmV_1cFbF5vhnbGUiEZ7l8bqbCcU-FPKgI";
const supabase = createClient(supabaseUrl, supabaseKey);

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
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
    members: [Member]  # Updated: Reference to Member type
  }

  type JobTitle {
    id: Int
    name: String
    members: [Member]  # Updated: Reference to Member type
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
    members: async () => {
      try {
        const { data: members, error } = await supabase
          .from("Member")
          .select("*");
        return members;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    role: async (_, { id }) => {
      try {
        const { data: role, error } = await supabase
          .from("Role")
          .select("*")
          .eq("id", id);
        return role[0];
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    jobTitle: async (_, { id }) => {
      try {
        const { data: jobTitle, error } = await supabase
          .from("JobTitle")
          .select("*")
          .eq("id", id);
        return jobTitle[0];
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  },
  Member: {
    role: async (parent) => {
      try {
        const { data: role, error } = await supabase
          .from("Role")
          .select("*")
          .eq("id", parent.role_id);
        return role[0];
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    jobTitle: async (parent) => {
      try {
        const { data: jobTitle, error } = await supabase
          .from("JobTitle")
          .select("*")
          .eq("id", parent.job_title_id);
        return jobTitle[0];
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  },
  Role: {
    // Role의 각 Member 조회
    members: async (parent) => {
      try {
        const { data: members, error } = await supabase
          .from("Member")
          .select("*")
          .eq("role_id", parent.id);
        return members;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  },

  JobTitle: {
    // JobTitle의 각 Member 조회
    members: async (parent) => {
      try {
        const { data: members, error } = await supabase
          .from("Member")
          .select("*")
          .eq("job_title_id", parent.id);
        return members;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
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
