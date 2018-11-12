const express = require('express');
const md5 = require('md5');
const faker = require('faker');
const _ = require('lodash');
const graphqlHTTP = require('express-graphql');
const {
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLSchema,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
} = require('graphql');

const app = express();
const port = process.env.PORT || 3000;

function getEmails() {
  return _.range(0, 200).map(i => {
    return {
      id: `email-${i}`,
      from: faker.internet.email(),
      title: faker.hacker.phrase(),
      recap: faker.lorem.sentence(10),
      body: faker.lorem.lines(80)
    }
  })
}

function getOrganizations() {
  return _.range(1, 7).map(i => {
    return {
      id: `${i}`,
      name: `Organization ${i}`,
      smallLogo: `https://www.gravatar.com/avatar/${md5(`john.doe@email${i}.fr`)}?d=retro&s=50`,
      logo: `https://www.gravatar.com/avatar/${md5(`john.doe@email${i}.fr`)}?d=retro&s=2048`,
      description: faker.lorem.lines(20)
    }
  })
}

const datas = {
  me: {
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    age: 42,
    phone: '0606060606'
  },
  organizations: getOrganizations(),
  'organizations-1-emails': getEmails(),
  'organizations-2-emails': getEmails(),
  'organizations-3-emails': getEmails(),
  'organizations-4-emails': getEmails(),
  'organizations-5-emails': getEmails(),
  'organizations-6-emails': getEmails(),
};

const EmailType = new GraphQLObjectType({
  name: 'Email',
  description: 'An Email',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLString), description: 'The id of the email.' },
    from: { type: GraphQLString, description: 'The address of the author.' },
    title: { type: GraphQLString, description: 'The title of the email.' },
    recap: { type: GraphQLString, description: 'The recap of the email.' },
    body: { type: GraphQLString, description: 'The body of the email.' }
  })
});

const OrganizationType = new GraphQLObjectType({
  name: 'Organization',
  description: 'An Organization',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLString), description: 'The id of the Organization.' },
    name: { type: GraphQLString, description: 'The name of the Organization.' },
    logo: { type: GraphQLString, description: 'The logo of the Organization.' },
    smallLogo: { type: GraphQLString, description: 'The smallLogo of the Organization.' },
    description: { type: GraphQLString, description: 'The description of the Organization.' },
    email: {
      type: EmailType,
      description: 'Fetch one email of the user',
      args: {
        id: { description: 'The id of the email', type: GraphQLString }
      },
      resolve: (root, args) => {
        return _.find(datas[`organizations-${root.id}-emails`], o => o.id === args.id)
      },
    },
    emails: {
      type: new GraphQLList(EmailType),
      description: 'Fetch all emails of the user',
      args: {
        limit: { description: 'Number of item to fetch', type: GraphQLInt }
      },
      resolve: (root, args) => {
        if (args.limit) {
          return _.take(datas[`organizations-${root.id}-emails`], args.limit);
        }
        return datas[`organizations-${root.id}-emails`]
      },
    }
  })
});

const MeType = new GraphQLObjectType({
  name: 'User',
  description: 'A user',
  fields: () => ({
    email: { type: new GraphQLNonNull(GraphQLString), description: 'The email address of the user.' },
    name: { type: GraphQLString, description: 'The name of the user.' },
    age: { type: GraphQLInt, description: 'The age of the user.' },
    phone: { type: GraphQLString, description: 'The phone of the user.' },
    organization: {
      type: OrganizationType,
      description: 'Fetch one organization of the user',
      args: {
        id: { description: 'The id of the organization', type: GraphQLString }
      },
      resolve: (root, args) => {
        return _.find(datas.organizations, o => o.id === args.id)
      },
    },
    organizations: {
      type: new GraphQLList(OrganizationType),
      description: 'Fetch all organizations of the user',
      args: {
        limit: { description: 'Number of item to fetch', type: GraphQLInt }
      },
      resolve: (root, args) => {
        if (args.limit) {
          return _.take(datas.organizations, args.limit);
        }
        return datas.organizations
      },
    }
  })
});

const QueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Main query to fetch wines and/or regions and/or a unique wine and/or region',
  fields: () => ({
    me: {
      type: MeType,
      description: 'Fetch user profile',
      resolve: (root, { id }) => {
        return datas.me;
      },
    }
  })
});

const EmailsSchema = new GraphQLSchema({
  query: QueryType,
  types: [ MeType, OrganizationType, EmailType, new GraphQLList(OrganizationType), new GraphQLList(EmailType) ]
});

app.use('/graphql', graphqlHTTP({
  schema: EmailsSchema,
  graphiql: true
}));

app.use('/assets', express.static('dist'));

app.get('/me', (req, res) => {
  res.send(datas.me);
});

app.get('/me/organizations', (req, res) => {
  res.send(datas.organizations);
});

app.get('/me/organizations/:id', (req, res) => {
  res.send(_.find(datas.organizations, e => e.id === req.params.id));
});

app.get('/me/organizations/:orga/emails', (req, res) => {
  res.send(datas[`organizations-${req.params.orga}-emails`]);
});

app.get('/me/organizations/:orga/emails/:id', (req, res) => {
  res.send(_.find(datas[`organizations-${req.params.orga}-emails`], e => e.id === req.params.id));
});

app.get('/', (req, res) => {
  res.type('html').send(`
<html>
  <head>
    <link rel="stylesheet" href="/assets/humantalks.min.css">
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.5.0/css/all.css" integrity="sha384-B4dIYHKNBt8Bc12p+WXckhzcICo0wtJAoU8YZTY5qE0Id1GSseTk6S+L3BlXeVIU" crossorigin="anonymous">
    <title>Graphql Demo</title>
  </head>
  <body>
    <div id="app"></div>
    <script src="/assets/humantalks.min.js"></script>
    <script>
      HumanTalks.init(document.getElementById('app'))
    </script>
  </body>
</html>  
  `);
})

app.listen(port, () => console.log(`graphql-demo listening on port ${port}!`))