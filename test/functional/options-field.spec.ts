import 'reflect-metadata';
import {
  instanceToInstance,
  classToClassFromExist,
  instanceToPlain,
  classToPlainFromExist,
  plainToInstance,
  plainToClassFromExist,
} from '../../src/index';
import { defaultMetadataStorage } from '../../src/storage';
import { Exclude, Expose, Type, Transform } from '../../src/decorators';

describe('options fields', () => {

  it('option fields', () => {

    class Photo {
      id: number;

      @Expose({
        groups: ['user', 'guest'],
      })
      filename: string;

      @Expose({
        groups: ['admin'],
      })
      status: number;

      metadata: string;
    }

    class User {
      id: number;
      firstName: string;

      @Expose({
        groups: ['user', 'guest'],
      })
      lastName: string;

      @Expose({
        groups: ['user'],
      })
      password: string;

      @Expose({
        groups: ['admin'],
      })
      isActive: boolean;

      @Type(type => Photo)
      photo: Photo;

      @Expose({
        groups: ['admin'],
      })
      @Type(type => Photo)
      photos: Photo[];
    }

    const user = new User();
    user.firstName = 'Umed';
    user.lastName = 'Khudoiberdiev';
    user.password = 'imnosuperman';
    user.isActive = false;
    user.photo = new Photo();
    user.photo.id = 1;
    user.photo.filename = 'myphoto.jpg';
    user.photo.status = 1;
    user.photos = [user.photo];

    const fromPlainUser = {
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      password: 'imnosuperman',
      isActive: false,
      photo: {
        id: 1,
        filename: 'myphoto.jpg',
        status: 1,
      },
      photos: [
        {
          id: 1,
          filename: 'myphoto.jpg',
          status: 1,
        },
      ],
    };

    const fromExistUser = new User();
    fromExistUser.id = 1;
    fromExistUser.photo = new Photo();
    fromExistUser.photo.metadata = 'taken by Camera';

    const plainUser1: any = instanceToPlain(user);
    expect(plainUser1).not.toBeInstanceOf(User);
    expect(plainUser1).toEqual({
      firstName: 'Umed',
      photo: {
        id: 1,
      },
    });
    expect(plainUser1.lastName).toBeUndefined();
    expect(plainUser1.password).toBeUndefined();
    expect(plainUser1.isActive).toBeUndefined();

    const plainUser2: any = instanceToPlain(user, { groups: ['user'], fields: ['lastName', 'firstName', 'photo'] });
    expect(plainUser2).not.toBeInstanceOf(User);
    expect(plainUser2).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      // password: 'imnosuperman',
      photo: {
        id: 1,
        filename: 'myphoto.jpg',
      },
    });
    expect(plainUser2.isActive).toBeUndefined();

    const transformedUser2 = plainToInstance(User, fromPlainUser, { groups: ['user'], fields: ['lastName', 'firstName', 'photo']  });
    expect(transformedUser2).toBeInstanceOf(User);
    expect(transformedUser2.photo).toBeInstanceOf(Photo);
    expect(transformedUser2).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      // password: 'imnosuperman',
      photo: {
        id: 1,
        filename: 'myphoto.jpg',
      },
    });

    const fromExistTransformedUser = plainToClassFromExist(fromExistUser, fromPlainUser, { groups: ['user'], fields: ['lastName', 'firstName', 'photo'] });
    expect(fromExistTransformedUser).toEqual(fromExistUser);
    expect(fromExistTransformedUser.photo).toEqual(fromExistUser.photo);
    expect(fromExistTransformedUser).toEqual({
      id: 1,
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      // password: 'imnosuperman',
      photo: {
        id: 1,
        metadata: 'taken by Camera',
        filename: 'myphoto.jpg',
      },
    });

    const classToClassUser = instanceToInstance(user, { groups: ['user'], fields: ['lastName', 'firstName', 'photo'] });
    expect(classToClassUser).toBeInstanceOf(User);
    expect(classToClassUser.photo).toBeInstanceOf(Photo);
    expect(classToClassUser).not.toEqual(user);
    expect(classToClassUser).not.toEqual(user.photo);
    expect(classToClassUser).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      //password: 'imnosuperman',
      photo: {
        id: 1,
        filename: 'myphoto.jpg',
      },
    });

    const classToClassFromExistUser = classToClassFromExist(user, fromExistUser, { groups: ['user'], fields: ['lastName', 'firstName', 'photo'] });
    expect(classToClassFromExistUser).toBeInstanceOf(User);
    expect(classToClassFromExistUser.photo).toBeInstanceOf(Photo);
    expect(classToClassFromExistUser).not.toEqual(user);
    expect(classToClassFromExistUser).not.toEqual(user.photo);
    expect(classToClassFromExistUser).toEqual(fromExistUser);
    expect(classToClassFromExistUser).toEqual({
      id: 1,
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      //password: 'imnosuperman',
      photo: {
        id: 1,
        metadata: 'taken by Camera',
        filename: 'myphoto.jpg',
      },
    });

    const plainUser3: any = instanceToPlain(user, { groups: ['guest'], fields: ['lastName', 'photo'] });
    expect(plainUser3).not.toBeInstanceOf(User);
    expect(plainUser3).toEqual({
      // firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      photo: {
        id: 1,
        filename: 'myphoto.jpg',
      },
    });
    expect(plainUser3.password).toBeUndefined();
    expect(plainUser3.isActive).toBeUndefined();

    const transformedUser3 = plainToInstance(User, fromPlainUser, { groups: ['guest'], fields: ['lastName', 'photo'] });
    expect(transformedUser3).toBeInstanceOf(User);
    expect(transformedUser3.photo).toBeInstanceOf(Photo);
    expect(transformedUser3).toEqual({
      // firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      photo: {
        id: 1,
        filename: 'myphoto.jpg',
      },
    });

    const plainUser4: any = instanceToPlain(user, { groups: ['admin'], fields: ['isActive', 'photo', 'photos'] });
    expect(plainUser4).not.toBeInstanceOf(User);
    expect(plainUser4).toEqual({
      // firstName: 'Umed',
      isActive: false,
      photo: {
        id: 1,
        status: 1,
      },
      photos: [
        {
          id: 1,
          status: 1,
        },
      ],
    });
    expect(plainUser4.lastName).toBeUndefined();
    expect(plainUser4.password).toBeUndefined();

    const transformedUser4 = plainToInstance(User, fromPlainUser, { groups: ['admin'], fields: ['isActive', 'photo', 'photos'] });
    expect(transformedUser4).toBeInstanceOf(User);
    expect(transformedUser4.photo).toBeInstanceOf(Photo);
    expect(transformedUser4.photos[0]).toBeInstanceOf(Photo);
    expect(transformedUser4).toEqual({
      // firstName: 'Umed',
      isActive: false,
      photo: {
        id: 1,
        status: 1,
      },
      photos: [
        {
          id: 1,
          status: 1,
        },
      ],
    });

    const plainUser5: any = instanceToPlain(user, { groups: ['admin', 'user'], fields: ['isActive', 'photo', 'photos', 'password'] });
    expect(plainUser5).not.toBeInstanceOf(User);
    expect(plainUser5).toEqual({
      // firstName: 'Umed',
      // lastName: 'Khudoiberdiev',
      password: 'imnosuperman',
      isActive: false,
      photo: {
        id: 1,
        filename: 'myphoto.jpg',
        status: 1,
      },
      photos: [
        {
          id: 1,
          filename: 'myphoto.jpg',
          status: 1,
        },
      ],
    });

    const transformedUser5 = plainToInstance(User, fromPlainUser, { groups: ['admin', 'user'], fields: ['isActive', 'photo', 'photos', 'password'] });
    expect(transformedUser5).toBeInstanceOf(User);
    expect(transformedUser5).toEqual({
      // firstName: 'Umed',
      // lastName: 'Khudoiberdiev',
      password: 'imnosuperman',
      isActive: false,
      photo: {
        id: 1,
        filename: 'myphoto.jpg',
        status: 1,
      },
      photos: [
        {
          id: 1,
          filename: 'myphoto.jpg',
          status: 1,
        },
      ],
    });
  });

});
