import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsInt, IsString, Length } from 'class-validator';

export class CharacterIdParam {
  @ApiProperty({
    description: 'Character ID',
    example: 10,
  })
  @IsInt()
  characterId!: number;
}

export class EmailSignUpBody {
  @IsEmail()
  @ApiProperty({ description: 'Email' })
  email!: string;

  @IsString()
  @ApiProperty({ description: 'Email Verify Code' })
  emailVerifyCode!: string;

  @IsString()
  @ApiProperty({ description: 'Password' })
  @Length(8, 32)
  password!: string;

  @IsString()
  @ApiProperty({ description: 'Character name' })
  characterName!: string;
}

export class EmailSignInBody {
  @IsEmail()
  @ApiProperty({ description: 'Email' })
  email!: string;

  @IsString()
  @ApiProperty({ description: 'Password' })
  password!: string;
}

export class TokenResponse {
  @IsString()
  @ApiProperty({ description: 'JWT token' })
  token!: string;
}

export class SignupVerifyEmailBody {
  @IsEmail()
  @ApiProperty({ description: 'Email' })
  email!: string;
}

export class VerifyEmailVerifyCodeBody {
  @IsEmail()
  @ApiProperty({ description: 'Email' })
  email!: string;

  @ApiProperty({ description: 'Verify Code' })
  code!: string;
}

export class SuccessResponse {
  @ApiProperty({ description: 'Is the request complete correctly' })
  ok!: boolean;
}

export class ResetPasswordBody {
  @IsEmail()
  @ApiProperty({ description: 'Email' })
  email!: string;

  @IsString()
  @ApiProperty({ description: 'Email Verify Code' })
  emailVerifyCode!: string;

  @IsString()
  @ApiProperty({ description: 'Password' })
  @Length(8, 32)
  password!: string;
}
