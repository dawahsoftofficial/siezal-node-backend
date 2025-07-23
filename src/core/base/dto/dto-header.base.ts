import {
  IsOptional,
  IsString,
  IsNumberString,
  Matches,
} from 'class-validator';


export class BaseHeaderDto {
  @IsOptional()
  @IsString()
  @Matches(/^([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+(:\d+)?$/, {
    message: 'Invalid host format. Example: localhost:3000 or example.com',
  })
  host?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(keep-alive|close|upgrade)$/i)
  connection?: string;

  @IsOptional()
  @IsString()
  @Matches(/^".*"$/, { message: 'sec-ch-ua should be in quotes' })
  'sec-ch-ua'?: string;

  @IsOptional()
  @IsString()
  'sec-ch-ua-mobile'?: string; // Usually '?0' or '?1'

  @IsOptional()
  @IsString()
  'sec-ch-ua-platform'?: string; // Usually in quotes like '"Windows"'

  @IsOptional()
  @IsString()
  'user-agent'?: string;

  @IsOptional()
  @IsString()
  @Matches(/^application\/json|application\/.*json|\*\/\*$/, {
    message: 'Accept header should be application/json or similar',
  })
  accept?: string;

  @IsOptional()
  @IsString()
  'accept-language'?: string; // Less strict validation for language tags

  @IsOptional()
  @IsString()
  @Matches(/^(same-origin|none|cross-site)$/i)
  'sec-fetch-site'?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(cors|navigate|no-cors|same-origin|websocket)$/i)
  'sec-fetch-mode'?: string;

  @IsOptional()
  @IsString()
  @Matches(
    /^(audio|audioworklet|document|embed|empty|font|image|manifest|object|paintworklet|report|script|serviceworker|sharedworker|style|track|video|worker|xslt)$/i,
  )
  'sec-fetch-dest'?: string;

  @IsOptional()
  @IsString()
  @Matches(/^https?:\/\/[^\s/$.?#].[^\s]*$/i, {
    message: 'Invalid referer format. Example: http://localhost:3000/docs',
  })
  referer?: string;

  @IsOptional()
  @IsString()
  @Matches(
    /^(gzip|deflate|br|zstd|compressed)(;q=\d(\.\d{0,3})?)?(,\s*(gzip|deflate|br|zstd|compressed)(;q=\d(\.\d{0,3})?)?)*$/i,
  )
  'accept-encoding'?: string;

  @IsOptional()
  @IsString()
  'sec-gpc'?: string; // Usually '1' for Global Privacy Control

  // Additional common headers
  @IsOptional()
  @IsString()
  cookie?: string;

  @IsOptional()
  @IsNumberString()
  'content-length'?: string;

  @IsOptional()
  @IsString()
  'if-none-match'?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(http|https)$/i, {
    message: 'x-forwarded-proto must be either "http" or "https"',
  })
  'x-forwarded-proto'?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d+$/, {
    message: 'x-forwarded-port must be a number',
  })
  'x-forwarded-port'?: string;

  @IsOptional()
  @IsString()
  @Matches(/^Root=[\w-]+(;Parent=[\w-]+)?(;Sampled=(0|1))?$/, {
    message: 'Invalid x-amzn-trace-id format',
  })
  'x-amzn-trace-id'?: string;

  @IsOptional()
  @IsString()
  priority?: string;
}
