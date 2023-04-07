const { graphql } = require("@octokit/graphql");
const fs = require("fs");
require("dotenv").config();

const pat = process.env.GITHUB_PAT;

// Use the PAT in your code

// Replace with your personal access token
const GITHUB_GRAPHQL_PAT = process.env.GITHUB_GRAPHQL_PAT;

const introspectionQuery = `
query IntrospectionQuery {
	__schema {
	  queryType { name }
	  mutationType { name }
	  subscriptionType { name }
	  types {
	    ...FullType
	  }
	  directives {
	    name
	    description
	    locations
	    args {
	      ...InputValue
	    }
	  }
	}
      }
      
      fragment FullType on __Type {
	kind
	name
	description
	fields(includeDeprecated: true) {
	  name
	  description
	  args {
	    ...InputValue
	  }
	  type {
	    ...TypeRef
	  }
	  isDeprecated
	  deprecationReason
	}
	inputFields {
	  ...InputValue
	}
	interfaces {
	  ...TypeRef
	}
	enumValues(includeDeprecated: true) {
	  name
	  description
	  isDeprecated
	  deprecationReason
	}
	possibleTypes {
	  ...TypeRef
	}
      }
      
      fragment InputValue on __InputValue {
	name
	description
	type { ...TypeRef }
	defaultValue
      }
      
      fragment TypeRef on __Type {
	kind
	name
	ofType {
	  kind
	  name
	  ofType {
	    kind
	    name
	    ofType {
	      kind
	      name
	      ofType {
		kind
		name
		ofType {
		  kind
		  name
		  ofType {
		    kind
		    name
		    ofType {
		      kind
		      name
		    }
		  }
		}
	      }
	    }
	  }
	}
      }      
`;

async function fetchIntrospectionData() {
  try {
    const response = await graphql(introspectionQuery, {
      headers: {
        // authorization: `Bearer ${GITHUB_GRAPHQL_PAT}`,
        authorization: `token ${GITHUB_GRAPHQL_PAT}`,
      },
    });

    // Save the introspection data to a JSON file
    fs.writeFileSync(
      "graphql/introspection-result.json",
      JSON.stringify(response, null, 2)
    );
    console.log(
      "Introspection data saved to graphql/introspection-result.json"
    );
  } catch (error) {
    console.error("Error fetching introspection data:", error);
  }
}

fetchIntrospectionData();
