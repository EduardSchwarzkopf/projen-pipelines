import { AwsCdkTypeScriptApp } from 'projen/lib/awscdk';
import { synthSnapshot } from 'projen/lib/util/synth';
import { GithubCDKPipeline } from '../src';

test('Github snapshot', () => {
  const p = new AwsCdkTypeScriptApp({
    cdkVersion: '2.102.0',
    defaultReleaseBranch: 'main',
    name: 'testapp',
  });

  new GithubCDKPipeline(p, {
    iamRoleArns: {
      synth: 'synthRole',
      assetPublishing: 'publishRole',
      deployment: {
        dev: 'devRole',
        prod: 'prodRole',
      },
    },
    pkgNamespace: '@assembly',
    stages: [{
      name: 'dev',
      env: {
        account: '123456789012',
        region: 'eu-central-1',
      },
    }, {
      name: 'prod',
      manualApproval: true,
      env: {
        account: '123456789012',
        region: 'eu-central-1',
      },
    }],
  });

  const snapshot = synthSnapshot(p);
  expect(snapshot['.github/workflows/deploy.yml']).toMatchSnapshot();
  expect(snapshot['.github/workflows/release-prod.yml']).toMatchSnapshot();
  expect(snapshot['package.json']).toMatchSnapshot();
  expect(snapshot['.projen/tasks.json']).toMatchSnapshot();
});

test('Github snapshot with multi stack', () => {
  const p = new AwsCdkTypeScriptApp({
    cdkVersion: '2.102.0',
    defaultReleaseBranch: 'main',
    name: 'testapp',
  });

  new GithubCDKPipeline(p, {
    iamRoleArns: {
      synth: 'synthRole',
      assetPublishing: 'publishRole',
      deployment: {
        dev: 'devRole',
        prod: 'prodRole',
      },
    },
    pkgNamespace: '@assembly',
    deploySubStacks: true,
    stages: [{
      name: 'dev',
      env: {
        account: '123456789012',
        region: 'eu-central-1',
      },
    }],
  });

  const snapshot = synthSnapshot(p);
  expect(snapshot['.github/workflows/deploy.yml']).toMatchSnapshot();
  expect(snapshot['.projen/tasks.json']).toMatchSnapshot();
});


test('Github snapshot with custom runner', () => {
  const p = new AwsCdkTypeScriptApp({
    cdkVersion: '2.132.0',
    defaultReleaseBranch: 'main',
    name: 'testapp',
  });

  new GithubCDKPipeline(p, {
    iamRoleArns: {
      synth: 'synthRole',
      assetPublishing: 'publishRole',
    },
    pkgNamespace: '@assembly',
    deploySubStacks: true,
    stages: [],
    runnerTags: ['custom-runner'],
  });

  const snapshot = synthSnapshot(p);
  expect(snapshot['.github/workflows/deploy.yml']).toMatchSnapshot();
});

test('Github snapshot with manual approval and GH packages', () => {
  const p = new AwsCdkTypeScriptApp({
    cdkVersion: '2.132.0',
    defaultReleaseBranch: 'main',
    name: 'testapp',
  });

  new GithubCDKPipeline(p, {
    iamRoleArns: {
      synth: 'synthRole',
      assetPublishing: 'publishRole',
    },
    useGithubPackagesForAssembly: true,
    pkgNamespace: '@assembly',
    stages: [{
      name: 'prod',
      manualApproval: true,
      env: {
        account: '123456789012',
        region: 'eu-central-1',
      },
    }],
  });

  const snapshot = synthSnapshot(p);
  expect(snapshot['.npmrc']).toMatchSnapshot();
  expect(snapshot['.github/workflows/deploy.yml']).toMatchSnapshot();
  expect(snapshot['.github/workflows/release-prod.yml']).toMatchSnapshot();
});