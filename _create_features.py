#!/usr/bin/env python3
import json, subprocess, sys

with open('stages/03-backlog/features.json') as f:
    features = json.load(f)

REPO = 'kevinmgates/agenticSDLC'
results = []
errors = []

for feat in features:
    epic_num = int(feat['epic_id'].split('-')[1])
    milestone = epic_num

    ac = '\n'.join([f'- [ ] {c}' for c in feat.get('acceptance_criteria', [])])
    dod = '\n'.join([f'- [ ] {d}' for d in feat.get('definition_of_done', [])])
    reqs = ', '.join(feat.get('linked_requirements', []))

    body = f"""## Description
{feat['description']}

**User Persona:** {feat['user_persona']}
**Priority:** {feat['priority']}
**Estimated Size:** {feat['estimated_size']}
**Epic:** {feat['epic_id']}

## Acceptance Criteria
{ac}

## Definition of Done
{dod}

## Linked Requirements
{reqs}"""

    title = f"[FEATURE] {feat['title']}"
    labels = ['feature', feat['priority'].lower(), feat['user_persona'].lower().replace(' ', '-')]

    cmd = [
        'gh', 'api', f'repos/{REPO}/issues', '--method', 'POST',
        '-f', f'title={title}',
        '-f', f'body={body}',
        '-F', f'milestone={milestone}',
        '--raw-field', f'labels={json.dumps(labels)}',
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            data = json.loads(result.stdout)
            results.append(f"{feat['id']}: Issue #{data['number']}")
            print(f"OK: {feat['id']} -> Issue #{data['number']}")
        else:
            errors.append(f"{feat['id']}: {result.stderr.strip()}")
            print(f"ERR: {feat['id']}: {result.stderr.strip()}")
    except Exception as e:
        errors.append(f"{feat['id']}: {str(e)}")
        print(f"ERR: {feat['id']}: {str(e)}")

print(f"\n=== Summary: {len(results)} created, {len(errors)} errors ===")
for e in errors:
    print(f'  ERROR: {e}')
