const user = (sequelize, DataTypes) => {

  const User = sequelize.define('user', {
    username: {
      type: DataTypes.STRING,
      unique: true,
    },
  });


  User.associate = models => {
    /**
     * Now, in case a user is deleted, we may want to perform a so called cascade delete for all messages in relation to the user. 
     * That's why you can extend schemas with a CASCADE flag. 
     * In this case, we add the flag to our user schema to remove all messages of this user on its deletion
     */
    User.hasMany(models.Message, { onDelete: 'CASCADE' });
  };

  User.findByLogin = async login => {
    let user = await User.findOne({
      where: { username: login },
    });
    if (!user) {
      user = await User.findOne({
        where: { email: login },
      });
    }
    return user;
  };

  return User;
};

export default user;