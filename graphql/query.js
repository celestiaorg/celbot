// REF: https://docs.github.com/en/graphql/overview/explorer

const { parse, validate, buildClientSchema } = require("graphql");
const introspectionResult = require("./introspection-result.json");

const schema = buildClientSchema(introspectionResult);

exports.isValid = async function (query) {
  let valid = true;
  // Parse the query
  let documentAST;
  try {
    documentAST = parse(query);
  } catch (error) {
    console.error("Invalid GraphQL query:", error.message);
    return false;
  }

  // Validate the query against the schema
  const validationErrors = validate(schema, documentAST);
  if (validationErrors.length > 0) {
    console.error("Validation errors:", validationErrors);
    return false;
  }
  return valid;
};

// graphqlQuery is a wrapper around the octokit.graphql method that checks if
// the query is valid and returns the result.
exports.graphqlQuery = async function (context, query, ...variables) {
  // Check if the query is valid
  if (!(await exports.isValid(query))) return;

  // Execute the query
  try {
    const result = await context.octokit.graphql(
      query,
      Object.assign({}, ...variables)
    );

    return result;
  } catch (error) {
    console.error(
      `Error fetching query
    ${query}
    
    Error:
    ${error}
    `
    );
    return;
  }
};

// TODO: this is a separate method because I was unsure how to get around the ID
// type error in the common method. Even though the documentation says that an
// input of a string should statisfy the ID type, it doesn't seem to work.
exports.graphqlAddProjectV2ItemByID = async function (
  context,
  query,
  projectID,
  contentID
) {
  // Check if the query is valid
  if (!(await exports.isValid(query))) return;

  // Execute the query
  try {
    const result = await context.octokit.graphql(`
mutation ($contentId: ID = "${contentID}", $projectId: ID = "${projectID}") {
	addProjectV2ItemById(input: {projectId: $projectId, contentId: $contentId}) {
	  clientMutationId
	}
}
`);

    return result;
  } catch (error) {
    console.error(
      `Error fetching query
    ${query}
    
    Error:
    ${error}
    `
    );
    return;
  }
};
