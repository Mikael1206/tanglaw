## Table `Scholarship`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `text` | Primary |
| `name` | `text` |  |
| `provider` | `text` |  |
| `sector` | `Sector` |  |
| `incomeBracket` | `text` |  |
| `programCategories` | `_text` |  Nullable |
| `minGwa` | `float8` |  |
| `requirements` | `text` |  |
| `benefits` | `text` |  |
| `returnService` | `bool` |  |
| `link` | `text` |  |
| `contentVector` | `vector` |  Nullable |

## Table `Question`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `text` | Primary |
| `type` | `QuestionType` |  |
| `difficulty` | `int4` |  |
| `assessmentMode` | `AssessmentMode` | Default `DIAGNOSTIC` |
| `sourceLabel` | `text` | Nullable |
| `sequenceNo` | `int4` | Default `0` |
| `isActive` | `bool` | Default `true` |
| `text` | `text` |  |
| `choices` | `jsonb` |  |
| `correctAnswer` | `text` |  |
| `explanation` | `text` |  |

## Table `User`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `text` | Primary |
| `email` | `text` |  |
| `name` | `text` |  Nullable |
| `passwordHash` | `text` |  Nullable |
| `emailVerified` | `bool` |  |
| `yearLevel` | `text` |  Nullable |
| `program` | `text` |  Nullable |
| `gwa` | `float8` |  Nullable |
| `financialStatus` | `text` |  Nullable |
| `createdAt` | `timestamp` |  |

## Table `Message`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `text` | Primary |
| `role` | `text` |  |
| `content` | `text` |  |
| `metadata` | `jsonb` |  Nullable |
| `createdAt` | `timestamp` |  |
| `userId` | `text` |  |

