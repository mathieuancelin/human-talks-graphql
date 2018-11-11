const express = require('express');
const md5 = require('md5');
const faker = require('faker');
const _ = require('lodash');
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

const datas = {
  me: {
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    age: 42,
    phone: '0606060606'
  },
  organizations: [
    {
      id: '1',
      name: 'Orga. 1',
      smallLogo: `https://www.gravatar.com/avatar/${md5('mathieu.ancelin@gmail.com')}?d=retro&s=50`,
      logo: `https://www.gravatar.com/avatar/${md5('mathieu.ancelin@gmail.com')}?d=retro&s=2048`,
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum'
    },
    {
      id: '2',
      name: 'Orga. 2',
      logo: `https://www.gravatar.com/avatar/${md5('mathieu.ancelin@serli.com')}?d=retro&s=2048`,
      smallLogo: `https://www.gravatar.com/avatar/${md5('mathieu.ancelin@serli.com')}?d=retro&s=50`,
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum'
    },
    {
      id: '3',
      name: 'Orga. 3',
      logo: `https://www.gravatar.com/avatar/${md5('mathieu.ancelin@humantlaks.com')}?d=retro&s=2048`,
      smallLogo: `https://www.gravatar.com/avatar/${md5('mathieu.ancelin@humantlaks.com')}?d=retro&s=50`,
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum'
    }
  ],
  'organizations-1-emails': getEmails(),
  'organizations-2-emails': getEmails(),
  'organizations-3-emails': getEmails(),
};

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